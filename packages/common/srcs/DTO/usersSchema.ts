import { z } from 'zod'

const LOGIN_REGEX = /^[\w-]{4,16}$/
const USERNAME_REGEX = /^[\w-]{4,16}$/

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

export const UserIdSchema = z
	.object({
		user_id: z.number().int().positive().min(1)
	})
	.meta({ description: 'User identifier schema' })

export const PublicUserAuthSchema = z
	.object({
		user_id: z.number().int().positive().min(1),
		login: LoginSchema
	})
	.strict()
	.meta({ description: 'Public user authentication schema' })

export const PublicUserListAuthSchema = z
	.object({
		users: z.array(PublicUserAuthSchema)
	})
	.strict()
	.meta({ description: 'List of public user authentications' })

export const UserPublicProfileSchema = z
	.object({
		user_id: z.number().int().positive(),
		username: UsernameSchema,
		avatar: z.string(),
		last_connection: z.string()
	})
	.meta({ description: 'Public user profile schema' })

export const UserPrivateProfileSchema = z
	.object({
		user_id: z.number().int().positive(),
		username: UsernameSchema,
		avatar: z.string(),
		last_connection: z.string()
	})
	.strict()
	.meta({ description: 'Private user profile schema' })

export const UserPrivateProfileListSchema = z
	.object({
		users: z.array(UserPrivateProfileSchema)
	})
	.strict()
	.meta({ description: 'List of private user profiles' })

export const UserProfileUpdateUsernameSchema = z
	.object({
		username: UsernameSchema
	})
	.strict()
	.meta({ description: 'Update username schema' })

export const UserProfileUpdateAvatarSchema = z
	.object({
		avatar: z.string()
	})
	.strict()
	.meta({ description: 'Update avatars schema' })

export const UserProfileUpdateSchema = z
	.object({
		username: UsernameSchema.optional(),
		avatar: z.string().optional()
	})
	.strict()
	.meta({ description: 'Update private user profile schema' })

// Webhook alias
export const UserCreatedWebhookSchema = PublicUserAuthSchema

// Typescript types
export type LoginDTO = z.infer<typeof LoginSchema>
export type UsernameDTO = z.infer<typeof UsernameSchema>
export type UserIdDTO = z.infer<typeof UserIdSchema>
export type PublicUserAuthDTO = z.infer<typeof PublicUserAuthSchema>
export type PublicUserListAuthDTO = z.infer<typeof PublicUserListAuthSchema>
export type UserPrivateProfileDTO = z.infer<typeof UserPrivateProfileSchema>
export type UserPrivateProfileListDTO = z.infer<
	typeof UserPrivateProfileListSchema
>
export type UserPublicProfileDTO = z.infer<typeof UserPublicProfileSchema>
