import { FastifyRequest, FastifyReply } from 'fastify'
import { FriendService } from '../usecases/friendService.js'
import { IUserId, AppError } from '@ft_transcendence/common'

// REVOIRBEARER
async function handleFriendAction(
	req: FastifyRequest,
	reply: FastifyReply,
	action: (userId: IUserId, friendId: IUserId, bearer?: string) => Promise<void>,
	successMessage: string
): Promise<void> {
	try {
		// JWT is already verified by jwtAuthMiddleware, req.user is guaranteed to exist
		const userIdValue = (req.user as { user_id: number }).user_id

		// Body is already validated and coerced by UserIdCoerceSchema to { user_id: number }
		// Zod ensures user_id is a positive integer, no undefined
		const { user_id: friendId } = req.body as { user_id: number }

		const userId: IUserId = { user_id: userIdValue }
		const friendUserId: IUserId = { user_id: friendId }

		// Do NOT forward Authorization header for service-to-service calls here.
		// Use the internal API (USERS_API_SECRET) from UsersApi by default.

		await action(userId, friendUserId)

		return void reply.code(200).send({ success: true, message: successMessage })
	} catch (error) {
		console.error(`Error in friend action:`, error)

		if (error instanceof AppError) {
			return void reply
				.code(error.status)
				.send({ success: false, error: error.message })
		}

		return void reply
			.code(500)
			.send({ success: false, error: 'Internal server error' })
	}
}

export async function requestFriendController(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	return handleFriendAction(
		req,
		reply,
		FriendService.sendFriendRequest,
		'Friend request sent'
	)
}

export async function acceptFriendController(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	return handleFriendAction(
		req,
		reply,
		FriendService.acceptFriendRequest,
		'Friend request accepted'
	)
}

export async function rejectFriendController(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	return handleFriendAction(
		req,
		reply,
		FriendService.rejectFriendRequest,
		'Friend request rejected'
	)
}

export async function cancelFriendController(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	return handleFriendAction(
		req,
		reply,
		FriendService.cancelFriendRequest,
		'Friend request canceled'
	)
}

export async function removeFriendController(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	return handleFriendAction(
		req,
		reply,
		FriendService.removeFriend,
		'Friend removed'
	)
}

export async function getFriendsListController(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	try {
		// Params are already validated and coerced by UserIdCoerceSchema
		const { user_id: userId } = req.params as { user_id: number }

		const userIdObj: IUserId = { user_id: userId }
		const friendsList = await FriendService.getFriendsList(userIdObj)

		return void reply.code(200).send({ friends: friendsList })
	} catch (error) {
		console.error(`Error fetching friends list:`, error)

		if (error instanceof AppError) {
			return void reply
				.code(error.status)
				.send({ success: false, error: error.message })
		}

		return void reply
			.code(500)
			.send({ success: false, error: 'Internal server error' })
	}
}

export async function getPendingRequestsController(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	try {
		// Params are already validated and coerced by UserIdCoerceSchema
		const { user_id: userId } = req.params as { user_id: number }

		const userIdObj: IUserId = { user_id: userId }
		const pendingRequests = await FriendService.getPendingRequests(userIdObj)

		return void reply.code(200).send(pendingRequests)
	} catch (error) {
		console.error(`Error fetching pending requests:`, error)

		if (error instanceof AppError) {
			return void reply
				.code(error.status)
				.send({ success: false, error: error.message })
		}

		return void reply
			.code(500)
			.send({ success: false, error: 'Internal server error' })
	}
}
