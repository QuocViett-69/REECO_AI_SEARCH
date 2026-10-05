import { z } from 'zod';

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export const MeSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string(),
  role: z.string().optional(),
});

export const UpdateMeRequestSchema = z.object({
  name: z.string().min(1).optional(),
});

export const AuthSessionSchema = z.object({
  access_token: z.string(),
  user: MeSchema,
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type Me = z.infer<typeof MeSchema>;
export type UpdateMeRequest = z.infer<typeof UpdateMeRequestSchema>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;
