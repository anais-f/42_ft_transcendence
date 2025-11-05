import { z } from 'zod'
import { RegisterLoginSchema } from './usersSchema.js'

export const RegisterSchema = z
	.object({
		login: RegisterLoginSchema,
		password: z.string().min(8).max(128)
	})
	.strict()

export const LoginActionSchema = z
	.object({
		login: RegisterLoginSchema,
		password: z.string().min(8).max(128)
	})
	.strict()

export const RegisterGoogleSchema = z
	.object({
		google_id: z.string().min(1)
	})
	.strict()
