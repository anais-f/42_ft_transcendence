import { z } from 'zod'

const USERNAME_REGEX = /^[A-Za-z0-9_-]{4,16}$/

export const UsernameSchema = z
	.string()
	.min(4)
	.max(32)
	.regex(USERNAME_REGEX, 'Invalid username')

export const PublicUserSchema = z
	.object({
		id_user: z.number().positive().min(1),
		username: UsernameSchema,
	})
	.strict()

export const PublicUserListSchema = z
	.object({
		users: z.array(PublicUserSchema),
	})
	.strict()
