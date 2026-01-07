import { z } from 'zod'
import { RegisterLoginSchema } from './usersSchema.js'

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[a-z])[^<>$]{8,128}$/

export const PasswordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters long')
	.max(128, 'Password must be at most 128 characters long')
	.regex(
		PASSWORD_REGEX,
		'Password must include at least one capital letter, one lower case letter and one number and exclude <>$ characters'
	)

export const RegisterSchema = z
	.object({
		login: RegisterLoginSchema,
		password: PasswordSchema
	})
	.strict()
	.meta({ description: 'User registration with login and password' })

export const LoginActionSchema = z
	.object({
		login: RegisterLoginSchema,
		password: PasswordSchema
	})
	.strict()
	.meta({ description: 'User login with credentials' })

export const RegisterGoogleSchema = z
	.object({
		google_id: z.string().min(1, 'Google ID is required')
	})
	.strict()
	.meta({ description: 'Google user registration with Google ID' })

export const LogoutParamsSchema = z
	.object({
		userId: z.coerce.number().int().positive().min(1)
	})
	.meta({ description: 'User ID parameter for logout' })

export const PasswordBodySchema = z
	.object({
		password: PasswordSchema
	})
	.strict()
	.meta({ description: 'Password in request body' })

export const LoginGoogleSchema = z
	.object({
		credential: z.string().min(1, 'Google credential is required')
	})
	.strict()
	.meta({ description: 'Google login with JWT credential' })

export const ChangeMyPasswordSchema = z
	.object({
		old_password: PasswordSchema,
		new_password: PasswordSchema,
		twofa_code: z
			.string()
			.length(6, '2FA code must be exactly 6 digits')
			.regex(/^\d{6}$/, '2FA code must contain only numbers')
			.optional()
	})
	.strict()
	.meta({
		description: 'Change password with old password and optional 2FA code'
	})

export const RegisterResponseSchema = z
	.object({
		message: z.string(),
		token: z.string()
	})
	.meta({
		description: 'Registration response with success message and auth token'
	})

export const LoginResponseSchema = z
	.object({
		pre_2fa_required: z.boolean(),
		token: z.string().optional()
	})
	.meta({
		description:
			'Login response indicating if 2FA is required and optional auth token'
	})

export const ConfigResponseSchema = z
	.object({
		googleClientId: z.string().nullable()
	})
	.meta({ description: 'Authentication configuration with Google client ID' })

export type PasswordBodyDTO = z.infer<typeof PasswordBodySchema>
export type RegisterDTO = z.infer<typeof RegisterSchema>
export type LoginActionDTO = z.infer<typeof LoginActionSchema>
export type RegisterGoogleDTO = z.infer<typeof RegisterGoogleSchema>
export type LogoutParamsDTO = z.infer<typeof LogoutParamsSchema>
export type ChangeMyPasswordDTO = z.infer<typeof ChangeMyPasswordSchema>
export type RegisterResponseDTO = z.infer<typeof RegisterResponseSchema>
export type LoginResponseDTO = z.infer<typeof LoginResponseSchema>
export type ConfigResponseDTO = z.infer<typeof ConfigResponseSchema>
