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

export const LoginGoogleSchema = z
	.object({
		credential: z.string().min(1)
	})
	.strict()

export const RegisterResponseSchema = z.object({
	message: z.string(),
	token: z.string()
})

export const LoginResponseSchema = z.object({
	pre_2fa_required: z.boolean(),
	token: z.string().optional()
})

export const ValidateAdminResponseSchema = z.object({
	success: z.boolean()
})

export const LogoutResponseSchema = z.object({
	success: z.boolean()
})

export const ConfigResponseSchema = z.object({
	googleClientId: z.string().nullable()
})

export const PasswordChangeResponseSchema = z.object({
	success: z.boolean()
})

export type PasswordBodyDTO = z.infer<typeof PasswordBodySchema>
export type RegisterDTO = z.infer<typeof RegisterSchema>
export type LoginActionDTO = z.infer<typeof LoginActionSchema>
export type RegisterGoogleDTO = z.infer<typeof RegisterGoogleSchema>
export type LogoutParamsDTO = z.infer<typeof LogoutParamsSchema>
export type RegisterResponseDTO = z.infer<typeof RegisterResponseSchema>
export type LoginResponseDTO = z.infer<typeof LoginResponseSchema>
export type ValidateAdminResponseDTO = z.infer<
	typeof ValidateAdminResponseSchema
>
export type LogoutResponseDTO = z.infer<typeof LogoutResponseSchema>
export type ConfigResponseDTO = z.infer<typeof ConfigResponseSchema>
export type PasswordChangeResponseDTO = z.infer<
	typeof PasswordChangeResponseSchema
>
