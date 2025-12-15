import { z } from 'zod'
import { RegisterLoginSchema } from './usersSchema.js'

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]{8,128}$/
//TODO : enhance password regex to enforce stronger passwords

export const PasswordSchema = z
    .string()
    .min(8)
    .max(128)
    .regex(PASSWORD_REGEX, 'Password must be 8-128 characters long and include at least one letter and one number')


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
		google_id: z.string().min(1)
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
		credential: z.string().min(1)
	})
	.strict()

export const ChangeMyPasswordSchema = z
	.object({
		old_password: PasswordSchema,
		new_password: PasswordSchema,
		twofa_code: z.string().length(6).regex(/^\d{6}$/).optional()
	})
	.strict()

export type PasswordBodyDTO = z.infer<typeof PasswordBodySchema>
export type RegisterDTO = z.infer<typeof RegisterSchema>
export type LoginActionDTO = z.infer<typeof LoginActionSchema>
export type RegisterGoogleDTO = z.infer<typeof RegisterGoogleSchema>
export type LogoutParamsDTO = z.infer<typeof LogoutParamsSchema>
export type ChangeMyPasswordDTO = z.infer<typeof ChangeMyPasswordSchema>
