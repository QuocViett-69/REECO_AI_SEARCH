import { z } from 'zod';

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(1),
  phone: z.string().optional(),
  company: z.string().optional(),
});

export const RefreshRequestSchema = z.object({
  refresh_token: z.string().min(1),
});

export const MeSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  role: z.string(),
  full_name: z.string().min(1),
  phone: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
});

export const UpdateMeRequestSchema = z.object({
  full_name: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
}).strict();

export const AuthSessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number().optional(),
  user: MeSchema,
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RefreshRequest = z.infer<typeof RefreshRequestSchema>;
export type Me = z.infer<typeof MeSchema>;
export type UpdateMeRequest = z.infer<typeof UpdateMeRequestSchema>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;
