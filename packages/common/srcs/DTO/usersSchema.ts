import { z } from 'zod'

const LOGIN_REGEX = /^[A-Za-z0-9_-]{4,16}$/
const USERNAME_REGEX = /^[A-Za-z0-9_-]{4,16}$/

export const LoginSchema = z
	.string()
	.min(4)
	.max(16)
	.regex(LOGIN_REGEX, 'Invalid login format')

export const UsernameSchema = z
  .string()
  .min(4)
  .max(16)
  .regex(USERNAME_REGEX, 'Invalid username format')

export const UserIdSchema = z.object({
	user_id: z.number().int().positive()
})

export const PublicUserAuthSchema = z
	.object({
		user_id: z.number().positive().min(1),
		login: LoginSchema
	})
	.strict()

export const PublicUserListAuthSchema = z
	.object({
		users: z.array(PublicUserAuthSchema)
	})
	.strict()

export const UserPrivateProfileSchema = z.object({
	user_id: z.number(),
	username: UsernameSchema,
	avatar: z.string(),
	status: z.number(),
	last_connection: z.string()
}).strict()

export const UserPrivateProfileListSchema = z
	.object({
		users: z.array(UserPrivateProfileSchema)

	})
	.strict()

// WEEBHOOKS TYPE
// Webhooks (auth -> users)
export const UserCreatedWebhookSchema = PublicUserAuthSchema

// TYPES TS
export type LoginDTO = z.infer<typeof LoginSchema>
export type UsernameDTO = z.infer<typeof UsernameSchema>
export type UserIdDTO = z.infer<typeof UserIdSchema>
export type PublicUserDTO = z.infer<typeof PublicUserAuthSchema>
export type PublicUserListDTO = z.infer<typeof PublicUserListAuthSchema>
export type UserPrivateProfileDTO = z.infer<typeof UserPrivateProfileSchema>
export type UserPrivateProfileListDTO = z.infer<typeof UserPrivateProfileListSchema>
