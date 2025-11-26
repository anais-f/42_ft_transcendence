import { FastifyRequest, FastifyReply } from 'fastify'
import { FriendService } from '../usecases/friendService.js'
import { IUserId, AppError } from '@ft_transcendence/common'

async function handleFriendAction(
	req: FastifyRequest,
	reply: FastifyReply,
	action: (userId: IUserId, friendId: IUserId) => Promise<void>,
	successMessage: string
): Promise<void> {
	try {
		const user = req.user as { user_id?: number } | undefined
		const userIdValue = Number(user?.user_id)

		if (!userIdValue || !Number.isInteger(userIdValue) || userIdValue <= 0) {
			return void reply
				.code(400)
				.send({ success: false, error: 'Invalid user ID' })
		}

		const { friendId } = req.body as { friendId: number }
		if (!friendId || !Number.isInteger(friendId) || friendId <= 0) {
			return void reply
				.code(400)
				.send({ success: false, error: 'Invalid friend ID' })
		}

		const userId: IUserId = { user_id: userIdValue }
		const friendUserId: IUserId = { user_id: friendId }

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
		const { userId } = req.params as { userId: string }
		const userIdValue = Number(userId)

		if (!userIdValue || !Number.isInteger(userIdValue) || userIdValue <= 0) {
			return void reply
				.code(400)
				.send({ success: false, error: 'Invalid user ID' })
		}

		const userIdObj: IUserId = { user_id: userIdValue }
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
		const user = req.user as { user_id?: number } | undefined
		const userIdValue = Number(user?.user_id)

		if (!userIdValue || !Number.isInteger(userIdValue) || userIdValue <= 0) {
			return void reply
				.code(400)
				.send({ success: false, error: 'Invalid user ID' })
		}

		const userId: IUserId = { user_id: userIdValue }
		const pendingRequests = await FriendService.getPendingRequests(userId)

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
