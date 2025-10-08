import { z } from 'zod'

import { UsernameSchema } from './usersDTO.js'

export const RegisterSchema = z.object({
  username: UsernameSchema,
  password: z.string().min(8).max(128)
}).strict()

export const LoginSchema = z.object({
  username: UsernameSchema,
  password: z.string().min(8).max(128)
}).strict()
