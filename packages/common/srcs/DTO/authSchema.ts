import { z } from 'zod'
import { RegisterLoginSchema } from './usersSchema.js'

const PASSWORD_REGEX =
	/^(?=.*[A-Z])(?=.*\d)(?=.*[a-z])[A-Za-z\d!@#$%^&*()_+=[\]{};':"\\|,./?-]{8,128}$/
//TODO : enhance password regex to enforce stronger passwords

export const PasswordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters long')
	.max(128, 'Password must be at most 128 characters long')
	.regex(
		PASSWORD_REGEX,
		'Password must include at least one capital letter, one lower case letter and one number'
	)

export const RegisterSchema = z
	.object({
		login: RegisterLoginSchema,
		password: PasswordSchema
	})
	.strict()

export const LoginActionSchema = z
	.object({
		login: RegisterLoginSchema,
		password: PasswordSchema
	})
	.strict()

export const RegisterGoogleSchema = z
	.object({
		google_id: z.string().min(1, 'Google ID is required')
	})
	.strict()

export const LogoutParamsSchema = z.object({
	userId: z.coerce.number().int().positive().min(1)
})

export const PasswordBodySchema = z
	.object({
		password: PasswordSchema
	})
	.strict()

export const LoginGoogleSchema = z
	.object({
		credential: z.string().min(1, 'Google credential is required')
	})
	.strict()

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

export const RegisterResponseSchema = z.object({
	message: z.string(),
	token: z.string()
})

export const LoginResponseSchema = z.object({
	pre_2fa_required: z.boolean(),
	token: z.string().optional()
})

export const ConfigResponseSchema = z.object({
	googleClientId: z.string().nullable()
})

export type PasswordBodyDTO = z.infer<typeof PasswordBodySchema>
export type RegisterDTO = z.infer<typeof RegisterSchema>
export type LoginActionDTO = z.infer<typeof LoginActionSchema>
export type RegisterGoogleDTO = z.infer<typeof RegisterGoogleSchema>
export type LogoutParamsDTO = z.infer<typeof LogoutParamsSchema>
export type ChangeMyPasswordDTO = z.infer<typeof ChangeMyPasswordSchema>
export type RegisterResponseDTO = z.infer<typeof RegisterResponseSchema>
export type LoginResponseDTO = z.infer<typeof LoginResponseSchema>
export type ConfigResponseDTO = z.infer<typeof ConfigResponseSchema>
