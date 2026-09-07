import mysql from 'mysql2/promise';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

declare global {
  // eslint-disable-next-line no-var
  var __windDbPool: mysql.Pool | undefined;
  // eslint-disable-next-line no-var
  var __windSqliteDb: any | undefined;
  // eslint-disable-next-line no-var
  var __windUseSqlite: boolean | undefined;
}

let sqliteDbInstance: any = null;
let useSqliteFallback = false;

function getSqliteDb() {
  if (global.__windSqliteDb) return global.__windSqliteDb;
  if (sqliteDbInstance) return sqliteDbInstance;

  // Initialize SQLite
  const dbDir = path.join(process.cwd(), 'db');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, 'wind_ai.sqlite');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Initialize SQLite Schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      status TEXT NOT NULL DEFAULT 'active',
      avatar_color TEXT NOT NULL DEFAULT '#6366f1',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_login_at TEXT NULL
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY,
      theme TEXT NOT NULL DEFAULT 'light',
      default_model TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
      temperature REAL NOT NULL DEFAULT 0.7,
      custom_instructions TEXT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT 'New chat',
      pinned INTEGER NOT NULL DEFAULT 0,
      archived INTEGER NOT NULL DEFAULT 0,
      model TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'complete',
      error_message TEXT NULL,
      token_count INTEGER NULL,
      edited INTEGER NOT NULL DEFAULT 0,
      attachment TEXT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );
  `);

  try {
    db.exec('ALTER TABLE messages ADD COLUMN attachment TEXT NULL;');
  } catch {
    // Column already exists
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS api_usage_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NULL,
      conversation_id TEXT NULL,
      model TEXT NOT NULL,
      prompt_tokens INTEGER NOT NULL DEFAULT 0,
      completion_tokens INTEGER NOT NULL DEFAULT 0,
      latency_ms INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'success',
      error_message TEXT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_id TEXT NULL,
      actor_email TEXT NULL,
      action TEXT NOT NULL,
      target_type TEXT NULL,
      target_id TEXT NULL,
      metadata TEXT NULL,
      ip_address TEXT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_by TEXT NULL
    );

    CREATE TABLE IF NOT EXISTS rate_limit_hits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bucket_key TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed default admin user if not exists
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@windai.app').toLowerCase();
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (!existingAdmin) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'ChangeMe123!', 10);
    const adminId = randomUUID();
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, avatar_color)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(adminId, 'Wind Admin', adminEmail, hash, 'admin', '#111827');
    db.prepare('INSERT OR IGNORE INTO user_settings (user_id) VALUES (?)').run(adminId);
  }

  // Seed system settings if not exists
  const existingSetting = db.prepare('SELECT key FROM system_settings WHERE key = ?').get('default_model');
  if (!existingSetting) {
    db.prepare('INSERT INTO system_settings (key, value) VALUES (?, ?)').run('default_model', JSON.stringify('gemini-2.0-flash'));
    db.prepare('INSERT INTO system_settings (key, value) VALUES (?, ?)').run('maintenance_mode', JSON.stringify(false));
    db.prepare('INSERT INTO system_settings (key, value) VALUES (?, ?)').run('max_messages_per_day', JSON.stringify(200));
    db.prepare('INSERT INTO system_settings (key, value) VALUES (?, ?)').run('signup_enabled', JSON.stringify(true));
  }

  sqliteDbInstance = db;
  if (process.env.NODE_ENV !== 'production') {
    global.__windSqliteDb = db;
  }
  return db;
}

function createPool(): mysql.Pool {
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'wind_ai',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    dateStrings: true,
    connectTimeout: 2000
  });
}

export const pool = global.__windDbPool || createPool();
if (process.env.NODE_ENV !== 'production') {
  global.__windDbPool = pool;
}

function adaptSqlForSqlite(sql: string): string {
  return sql
    .replace(/NOW\(\)\s*-\s*INTERVAL\s*(\d+)\s*DAY/gi, "datetime('now', '-$1 days')")
    .replace(/NOW\(\)/gi, "datetime('now')")
    .replace(/CURDATE\(\)/gi, "date('now')")
    .replace(/DATE\(([^)]+)\)/gi, "date($1)");
}

function sanitizeParamsForSqlite(params: unknown[]): unknown[] {
  return params.map((p) => {
    if (p === undefined) return null;
    if (p instanceof Date) {
      return p.toISOString().replace('T', ' ').replace(/\..+/, '');
    }
    if (typeof p === 'boolean') {
      return p ? 1 : 0;
    }
    return p;
  });
}

export async function query<T extends RowDataPacket[] = RowDataPacket[]>(
  sql: string,
  params: unknown[] = []
): Promise<T> {
  if (useSqliteFallback || global.__windUseSqlite) {
    const db = getSqliteDb();
    const adapted = adaptSqlForSqlite(sql);
    const sanitized = sanitizeParamsForSqlite(params);
    const stmt = db.prepare(adapted);
    const rows = stmt.all(...sanitized);
    return rows as unknown as T;
  }

  try {
    const [rows] = await pool.query<T>(sql, params as any);
    return rows;
  } catch (err: any) {
    if (
      err?.code === 'ECONNREFUSED' ||
      err?.code === 'PROTOCOL_CONNECTION_LOST' ||
      err?.code === 'ETIMEDOUT' ||
      err?.code === 'ER_BAD_DB_ERROR'
    ) {
      // Switch permanently to SQLite fallback
      useSqliteFallback = true;
      global.__windUseSqlite = true;
      const db = getSqliteDb();
      const adapted = adaptSqlForSqlite(sql);
      const sanitized = sanitizeParamsForSqlite(params);
      const stmt = db.prepare(adapted);
      const rows = stmt.all(...sanitized);
      return rows as unknown as T;
    }
    throw err;
  }
}

export async function execute(sql: string, params: unknown[] = []): Promise<ResultSetHeader> {
  if (useSqliteFallback || global.__windUseSqlite) {
    const db = getSqliteDb();
    const adapted = adaptSqlForSqlite(sql);
    const sanitized = sanitizeParamsForSqlite(params);
    const stmt = db.prepare(adapted);
    const result = stmt.run(...sanitized);
    return {
      affectedRows: result.changes,
      insertId: Number(result.lastInsertRowid || 0),
      warningStatus: 0,
      fieldCount: 0,
      message: '',
      serverStatus: 2,
      info: '',
      changedRows: 0
    } as unknown as ResultSetHeader;
  }

  try {
    const [result] = await pool.execute<ResultSetHeader>(sql, params as any);
    return result;
  } catch (err: any) {
    if (
      err?.code === 'ECONNREFUSED' ||
      err?.code === 'PROTOCOL_CONNECTION_LOST' ||
      err?.code === 'ETIMEDOUT' ||
      err?.code === 'ER_BAD_DB_ERROR'
    ) {
      useSqliteFallback = true;
      global.__windUseSqlite = true;
      const db = getSqliteDb();
      const adapted = adaptSqlForSqlite(sql);
      const sanitized = sanitizeParamsForSqlite(params);
      const stmt = db.prepare(adapted);
      const result = stmt.run(...sanitized);
      return {
        affectedRows: result.changes,
        insertId: Number(result.lastInsertRowid || 0),
        warningStatus: 0,
        fieldCount: 0,
        message: '',
        serverStatus: 2,
        info: '',
        changedRows: 0
      } as unknown as ResultSetHeader;
    }
    throw err;
  }
}

export type { RowDataPacket, ResultSetHeader };
