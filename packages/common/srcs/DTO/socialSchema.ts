import { z } from 'zod'
import { UserStatus } from '../interfaces/usersModels.js'

export const FriendsListSchema = z.object({
	friends: z.array(
		z.object({
			user_id: z.number(),
			username: z.string().min(1),
			avatar: z.string().min(1),
			status: z.enum(UserStatus),
			last_connection: z.string()
		})
	)
})

export const PendingFriendsListSchema = z.object({
	pendingFriends: z.array(
		z.object({
			user_id: z.number(),
			username: z.string().min(1),
			avatar: z.string().min(1)
		})
	)
})

export const StatusBroadcastSchema = z.object({
	userId: z.number().int().positive(),
	status: z.enum(UserStatus),
	timestamp: z.string().datetime()
})

export type FriendsListDTO = z.infer<typeof FriendsListSchema>['friends']
export type PendingFriendsListDTO = z.infer<
	typeof PendingFriendsListSchema
>['pendingFriends']
export type StatusBroadcastDTO = z.infer<typeof StatusBroadcastSchema>
