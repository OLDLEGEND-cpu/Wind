import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email').max(190),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[0-9]/, 'Include at least one number')
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required').max(128)
});

export const createMessageSchema = z.object({
  content: z.string().trim().min(1, 'Message cannot be empty').max(20000),
  conversationId: z.string().uuid().optional(),
  model: z.string().max(60).optional()
});

export const editMessageSchema = z.object({
  content: z.string().trim().min(1).max(20000)
});

export const renameConversationSchema = z.object({
  title: z.string().trim().min(1, 'Title cannot be empty').max(255)
});

export const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  defaultModel: z.string().max(60).optional(),
  temperature: z.number().min(0).max(2).optional(),
  customInstructions: z.string().max(4000).optional().nullable()
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  avatarColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional()
});

export const adminUpdateUserSchema = z.object({
  role: z.enum(['user', 'admin']).optional(),
  status: z.enum(['active', 'suspended']).optional(),
  name: z.string().trim().min(2).max(120).optional()
});

export const adminSettingsSchema = z.object({
  key: z.string().min(1).max(80),
  value: z.any()
});

export function formatZodError(error: z.ZodError): string {
  return error.errors.map((e) => e.message).join(', ');
}
