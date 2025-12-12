import { z } from 'zod'
import { RegisterLoginSchema } from './usersSchema.js'

//TODO : a changer les regles du password

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

export const LogoutParamsSchema = z.object({
	userId: z.coerce.number().int().positive().min(1)
})

export const PasswordBodySchema = z
	.object({
		password: z.string().min(6).max(128)
	})
	.strict()

export const  LoginGoogleSchema = z
	.object({
		credential: z.string().min(1)
	})
	.strict()

export type PasswordBodyDTO = z.infer<typeof PasswordBodySchema>
export type RegisterDTO = z.infer<typeof RegisterSchema>
export type LoginActionDTO = z.infer<typeof LoginActionSchema>
export type RegisterGoogleDTO = z.infer<typeof RegisterGoogleSchema>
export type LogoutParamsDTO = z.infer<typeof LogoutParamsSchema>
