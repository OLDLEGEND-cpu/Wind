import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query, execute } from '@/lib/db';
import { jsonError, jsonOk, handleApiError, HttpError } from '@/lib/apiUtils';
import { updateProfileSchema, formatZodError } from '@/lib/validation';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return jsonError('Not authenticated', 401);

  const settingsRows = await query<any[]>(
    'SELECT theme, default_model, temperature, custom_instructions FROM user_settings WHERE user_id = ? LIMIT 1',
    [user.id]
  );
  const settings = settingsRows[0] || {
    theme: 'light',
    default_model: 'gemini-3.6-flash',
    temperature: 0.7,
    custom_instructions: null
  };

  return jsonOk({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarColor: user.avatar_color,
      createdAt: user.created_at
    },
    settings: {
      theme: settings.theme,
      defaultModel: settings.default_model,
      temperature: Number(settings.temperature),
      customInstructions: settings.custom_instructions
    }
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) throw new HttpError('Not authenticated', 401);

    const body = await req.json().catch(() => null);
    if (!body) throw new HttpError('Invalid request body', 400);

    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) throw new HttpError(formatZodError(parsed.error), 422);

    const updates: string[] = [];
    const values: unknown[] = [];
    if (parsed.data.name) {
      updates.push('name = ?');
      values.push(parsed.data.name);
    }
    if (parsed.data.avatarColor) {
      updates.push('avatar_color = ?');
      values.push(parsed.data.avatarColor);
    }
    if (updates.length > 0) {
      values.push(user.id);
      await execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
      await logAudit({
        actorId: user.id,
        actorEmail: user.email,
        action: 'user.update_profile',
        targetType: 'user',
        targetId: user.id
      });
    }

    return jsonOk({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
