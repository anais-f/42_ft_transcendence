import { z } from 'zod'

export const FriendsListSchema = z.object({
	friends: z.array(
		z.object({
			user_id: z.number(),
			username: z.string().min(1),
			avatar: z.string().min(1),
			status: z.number().int().nonnegative(),
			last_connection: z.string()
		})
	)
})
