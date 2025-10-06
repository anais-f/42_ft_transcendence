import { z } from 'zod'

// Username 4-16 alphanum + _ -
const USERNAME_REGEX = /^[A-Za-z0-9_-]{4,16}$/

export const UsernameSchema = z.string()
  .min(4)
  .max(16)
  .regex(USERNAME_REGEX, 'Invalid username')

export const UserSchema = z.object({
  id: z.number().int().positive(),
  username: UsernameSchema
}).strict()

export const RegisterSchema = z.object({
  username: UsernameSchema,
  password: z.string().min(8).max(128)
}).strict()

export const LoginSchema = z.object({
  username: UsernameSchema,
  password: z.string().min(8).max(128)
}).strict()

export type UserDTO = z.infer<typeof UserSchema>
export type RegisterDTO = z.infer<typeof RegisterSchema>
export type LoginDTO = z.infer<typeof LoginSchema>
