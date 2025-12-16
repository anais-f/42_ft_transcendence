import { z } from 'zod'
import { UserStatus } from '../interfaces/usersModels.js'

const LOGIN_REGEX = /^[\w-]{4,32}$/
const USERNAME_REGEX = /^[\w-]{4,32}$/

export const RegisterLoginSchema = z
	.string()
	.min(4, 'Login must be at least 4 characters long')
	.max(32, 'Login must be at most 32 characters long')
	.regex(
		LOGIN_REGEX,
		'Login can only contain letters, numbers, underscores, and hyphens'
	)
	.refine((value) => !value.startsWith('google-'), {
		message: 'Login cannot start with "google-"'
	})

export const LoginSchema = z
	.string()
	.min(4, 'Login must be at least 4 characters long')
	.max(32, 'Login must be at most 32 characters long')
	.regex(
		LOGIN_REGEX,
		'Login can only contain letters, numbers, underscores, and hyphens'
	)

export const UsernameSchema = z
	.string()
	.min(4, 'Username must be at least 4 characters long')
	.max(32, 'Username must be at most 32 characters long')
	.regex(
		USERNAME_REGEX,
		'Username can only contain letters, numbers, underscores, and hyphens'
	)

export const UserIdSchema = z
	.object({
		user_id: z.number().int().positive()
	})
	.meta({ description: 'User identifier schema' })

export const UserIdCoerceSchema = z
	.object({
		user_id: z.coerce.number().int().positive()
	})
	.meta({ description: 'User identifier schema with coercion' })

export const PublicUserAuthSchema = z
	.object({
		user_id: z.number().int().positive(),
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
		status: z.number().int().nonnegative(),
		last_connection: z.string()
	})
	.meta({ description: 'Public user profile schema' })

export const UserPrivateProfileSchema = z
	.object({
		user_id: z.number().int().positive(),
		username: UsernameSchema,
		avatar: z.string(),
		status: z.number().int().nonnegative(),
		last_connection: z.string(),
		two_fa_enabled: z.boolean().optional()
	})
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

export const UpdateUserStatusSchema = z
	.object({
		status: z.union([z.literal(0), z.literal(1)]),
		lastConnection: z.string().datetime().optional()
	})
	.strict()
	.refine(
		(data) => data.status !== UserStatus.OFFLINE || !!data.lastConnection,
		{
			message: 'lastConnection is required when status is 0 (offline)'
		}
	)
	.meta({ description: 'Update user status schema' })

export const UserSearchResultSchema = z
	.object({
		user_id: z.number().int().positive(),
		username: UsernameSchema,
		avatar: z.string()
	})
	.meta({ description: 'Simple user search result schema' })

export const UserCreatedWebhookSchema = PublicUserAuthSchema

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
export type UserProfileUpdateUsernameDTO = z.infer<
	typeof UserProfileUpdateUsernameSchema
>
export type UserProfileUpdateAvatarDTO = z.infer<
	typeof UserProfileUpdateAvatarSchema
>
export type UserProfileUpdateDTO = z.infer<typeof UserProfileUpdateSchema>
export type UpdateUserStatusDTO = z.infer<typeof UpdateUserStatusSchema>
export type UserSearchResultDTO = z.infer<typeof UserSearchResultSchema>
