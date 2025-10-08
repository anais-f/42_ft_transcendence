import { z } from 'zod';

export const UsernameSchema = z.string().min(4).max(16).regex(/[\w_-]{4,16}/g)

export const UserSchema = z.object({
  id: z.number().int().positive(),
  username: UsernameSchema
}).strict()

export const LoginSchema = z.object({
  username: UsernameSchema,
  password: z.string().min(8).max(128)
})
