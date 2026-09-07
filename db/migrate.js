/* eslint-disable no-console */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  const dbName = process.env.DB_NAME || 'wind_ai';
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4`);
  await conn.query(`USE \`${dbName}\``);

  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    console.log('Running migration:', file);
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    await conn.query(sql);
  }

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@windai.app').toLowerCase();
  const [rows] = await conn.query('SELECT id FROM users WHERE email = ?', [adminEmail]);
  if (Array.isArray(rows) && rows.length === 0) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'ChangeMe123!', 12);
    const id = randomUUID();
    await conn.query(
      'INSERT INTO users (id, name, email, password_hash, role, avatar_color) VALUES (?, ?, ?, ?, ?, ?)',
      [id, 'Wind Admin', adminEmail, hash, 'admin', '#111827']
    );
    await conn.query('INSERT INTO user_settings (user_id) VALUES (?)', [id]);
    console.log('Created admin user:', adminEmail);
  } else {
    console.log('Admin user already exists:', adminEmail);
  }

  console.log('Migration complete.');
  await conn.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
