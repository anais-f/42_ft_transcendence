import { z } from 'zod'
import { LoginSchema } from './usersSchema.js'

export const RegisterSchema = z
	.object({
		login: LoginSchema,
		password: z.string().min(8).max(128)
	})
	.strict()

export const LoginActionSchema = z
	.object({
		login: LoginSchema,
		password: z.string().min(8).max(128)
	})
	.strict()
