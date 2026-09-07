import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { execute } from '@/lib/db';
import { updateSettingsSchema, formatZodError } from '@/lib/validation';
import { jsonOk, handleApiError, HttpError } from '@/lib/apiUtils';

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) throw new HttpError('Not authenticated', 401);

    const body = await req.json().catch(() => null);
    if (!body) throw new HttpError('Invalid request body', 400);

    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) throw new HttpError(formatZodError(parsed.error), 422);

    const fields: string[] = [];
    const values: unknown[] = [];

    if (parsed.data.theme) {
      fields.push('theme = ?');
      values.push(parsed.data.theme);
    }
    if (parsed.data.defaultModel) {
      fields.push('default_model = ?');
      values.push(parsed.data.defaultModel);
    }
    if (typeof parsed.data.temperature === 'number') {
      fields.push('temperature = ?');
      values.push(parsed.data.temperature);
    }
    if (parsed.data.customInstructions !== undefined) {
      fields.push('custom_instructions = ?');
      values.push(parsed.data.customInstructions);
    }

    if (fields.length === 0) {
      return jsonOk({ success: true });
    }

    values.push(user.id);
    await execute(`UPDATE user_settings SET ${fields.join(', ')} WHERE user_id = ?`, values);

    return jsonOk({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
