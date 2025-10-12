import { z } from 'zod'

const USERNAME_REGEX = /^[A-Za-z0-9_-]{4,16}$/

export const UsernameSchema = z
	.string()
	.min(4)
	.max(16)
	.regex(USERNAME_REGEX, 'Invalid username')

export const UserIdSchema = z.object({
	id_user: z.number().int().positive()
})

export const PublicUserSchema = z
	.object({
		id_user: z.number().positive().min(1),
		username: UsernameSchema
	})
	.strict()


export const PublicUserListSchema = z
	.object({
		users: z.array(PublicUserSchema)
	})
	.strict()
	

export const UserAccountSchema = z
  .object({
    id_user: z.number().int().positive(),
    avatar: z.string(),
    status: z.number().int().min(0).max(1),
    last_connection: z.string()
  })
  .strict() 

export const UserProfileSchema = z.object({
	id_user: z.number(),
	username: UsernameSchema,
	avatar: z.string(),
	status: z.number(),
	last_connection: z.string()
})

export const UserProfileListSchema = z
	.object({
		users: z.array(UserProfileSchema)
	})
	.strict()


// WEEBHOOKS TYPE
// Webhooks (auth -> users)
export const UserCreatedWebhookSchema = PublicUserSchema

// TYPES TS
export type UserIdDTO = z.infer<typeof UserIdSchema>
export type UsernameDTO = z.infer<typeof UsernameSchema>
export type PublicUserDTO = z.infer<typeof PublicUserSchema>
export type PublicUserListDTO = z.infer<typeof PublicUserListSchema>
export type UserAccountDTO = z.infer<typeof UserAccountSchema>
export type UserProfileDTO = z.infer<typeof UserProfileSchema>
export type UserProfileListDTO = z.infer<typeof UserProfileListSchema>
export type UserCreatedWebhookDTO = z.infer<typeof UserCreatedWebhookSchema>
