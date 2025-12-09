import { FastifyRequest, FastifyReply } from 'fastify'
import { FriendService } from '../usecases/friendService.js'
import { IUserId } from '@ft_transcendence/common'
import createHttpError from 'http-errors'

async function handleFriendAction(
	req: FastifyRequest,
	reply: FastifyReply,
	action: (userId: IUserId, friendId: IUserId) => Promise<void>,
	successMessage: string
): Promise<void> {
	if (!req.user) throw createHttpError.Unauthorized('Unauthorized')

	const userIdValue = (req.user as { user_id: number }).user_id
	const userId: IUserId = { user_id: userIdValue }

	const friendId = (req.body as { user_id: number }).user_id
	const friendUserId: IUserId = { user_id: friendId }

	await action(userId, friendUserId)

	reply.code(200).send({ message: successMessage })
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
	if (!req.user) throw createHttpError.Unauthorized('Unauthorized')

	const userIdValue = (req.user as { user_id: number }).user_id
	const userId: IUserId = { user_id: userIdValue }
	const friendsList = await FriendService.getFriendsList(userId)

	reply.code(200).send({ friends: friendsList })
}

export async function getPendingRequestsController(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	if (!req.user) throw createHttpError.Unauthorized('Unauthorized')

	const userIdValue = (req.user as { user_id: number }).user_id
	const userId: IUserId = { user_id: userIdValue }
	const pendingRequests = await FriendService.getPendingRequests(userId)

	reply.code(200).send(pendingRequests)
}

export async function getPendingSentRequestsController(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	if (!req.user) throw createHttpError.Unauthorized('Unauthorized')

	const userIdValue = (req.user as { user_id: number }).user_id
	const userId: IUserId = { user_id: userIdValue }
	const pendingRequests = await FriendService.getPendingSentRequests(userId)

	reply.code(200).send(pendingRequests)
}
