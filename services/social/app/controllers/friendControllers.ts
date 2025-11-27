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
		const userIdValue = (req.user as { user_id: number }).user_id
		const { user_id: friendId } = req.body as { user_id: number }

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
