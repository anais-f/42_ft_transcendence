import { SocialRepository } from '../repositories/socialRepository.js'
import {
	IUserId,
	AppError,
	ERROR_MESSAGES,
	IPrivateUser,
	PendingFriendsListDTO
} from '@ft_transcendence/common'
import { UsersApi } from '../repositories/UsersApi.js'

export class FriendService {
	static async sendFriendRequest(
		userId: IUserId,
		friendId: IUserId
	): Promise<void> {
		if (userId.user_id === friendId.user_id)
			throw new AppError(ERROR_MESSAGES.CANNOT_ADD_YOURSELF, 400)

		const friendExisted = await UsersApi.userExists(friendId)
		if (!friendExisted)
			throw new AppError(ERROR_MESSAGES.INVALID_FRIEND_ID, 404)

		const existingRelation = SocialRepository.getRelationStatus(
			userId,
			friendId
		)
		if (existingRelation === 1)
			throw new AppError(ERROR_MESSAGES.RELATION_ALREADY_EXISTS, 400)

		if (existingRelation === 0) {
			const originId = SocialRepository.getOriginId(userId, friendId)
			if (originId === userId.user_id)
				throw new AppError(ERROR_MESSAGES.REQUEST_ALREADY_SENT, 400)
			else {
				//TODO : call le endpointpoint pour accepter l'invitation
			}
		}

		SocialRepository.addRelation(userId, friendId, userId)

		// TODO: notification

		return
	}

	static async acceptFriendRequest(
		userId: IUserId,
		friendId: IUserId
	): Promise<void> {
		if (userId.user_id === friendId.user_id)
			throw new AppError(ERROR_MESSAGES.CANNOT_ACCEPT_YOURSELF, 400)

		const friendExisted = await UsersApi.userExists(friendId)
		if (!friendExisted)
			throw new AppError(ERROR_MESSAGES.INVALID_FRIEND_ID, 404)

		const status = SocialRepository.getRelationStatus(userId, friendId)
		if (status === -1)
			throw new AppError(ERROR_MESSAGES.NO_PENDING_REQUEST, 404)
		if (status === 1)
			throw new AppError(ERROR_MESSAGES.RELATION_ALREADY_EXISTS, 400)

		const originId = SocialRepository.getOriginId(userId, friendId)
		if (originId === userId.user_id)
			throw new AppError(ERROR_MESSAGES.CANNOT_ACCEPT_YOURSELF, 400)

		SocialRepository.updateRelationStatus(userId, friendId, 1)

		//TODO: notification
	}

	static async rejectFriendRequest(
		userId: IUserId,
		friendId: IUserId
	): Promise<void> {
		if (userId.user_id === friendId.user_id)
			throw new AppError(ERROR_MESSAGES.CANNOT_REJECT_YOURSELF, 400)

		const friendExisted = await UsersApi.userExists(friendId)
		if (!friendExisted)
			throw new AppError(ERROR_MESSAGES.INVALID_FRIEND_ID, 404)

		const status = SocialRepository.getRelationStatus(userId, friendId)
		if (status !== 0) throw new AppError(ERROR_MESSAGES.NO_PENDING_REQUEST, 404)

		const originId = SocialRepository.getOriginId(userId, friendId)
		if (originId === userId.user_id)
			throw new AppError(ERROR_MESSAGES.CANNOT_REJECT_YOURSELF, 400)

		SocialRepository.deleteRelation(userId, friendId)

		// TODO : notification
	}

	static async cancelFriendRequest(
		userId: IUserId,
		friendId: IUserId
	): Promise<void> {
		if (userId.user_id === friendId.user_id)
			throw new AppError(ERROR_MESSAGES.CANNOT_CANCEL_YOURSELF, 400)

		const friendExisted = await UsersApi.userExists(friendId)
		if (!friendExisted)
			throw new AppError(ERROR_MESSAGES.INVALID_FRIEND_ID, 404)

		const status = SocialRepository.getRelationStatus(userId, friendId)
		if (status !== 0) throw new AppError(ERROR_MESSAGES.NO_PENDING_REQUEST, 404)

		const originId = SocialRepository.getOriginId(userId, friendId)
		if (originId !== userId.user_id)
			throw new AppError(ERROR_MESSAGES.CANNOT_CANCEL_YOURSELF, 400)

		SocialRepository.deleteRelation(userId, friendId)
	}

	static async removeFriend(userId: IUserId, friendId: IUserId): Promise<void> {
		if (userId.user_id === friendId.user_id)
			throw new AppError(ERROR_MESSAGES.CANNOT_DELETE_YOURSELF, 400)

		const friendExisted = await UsersApi.userExists(friendId)
		if (!friendExisted)
			throw new AppError(ERROR_MESSAGES.INVALID_FRIEND_ID, 404)

		const status = SocialRepository.getRelationStatus(userId, friendId)
		if (status !== 1) throw new AppError(ERROR_MESSAGES.NOT_FRIENDS, 400)

		SocialRepository.deleteRelation(userId, friendId)

		// TODO: notif ?
	}

	static async getFriendsList(userId: IUserId): Promise<IPrivateUser[]> {
		const userExisted = await UsersApi.userExists(userId)
		if (!userExisted) throw new AppError(ERROR_MESSAGES.INVALID_USER_ID, 404)

		const friendIds = SocialRepository.getFriendsList(userId)
		return await Promise.all(
			friendIds.map((friendId) => UsersApi.getUserData(friendId))
		)
	}

	static async getPendingRequests(
		userId: IUserId
	): Promise<{ pendingFriends: PendingFriendsListDTO }> {
		const userExisted = await UsersApi.userExists(userId)
		if (!userExisted) throw new AppError(ERROR_MESSAGES.INVALID_USER_ID, 404)

		const pendingIds = SocialRepository.getPendingListToApprove(userId)
		const pendingFriends = await Promise.all(
			pendingIds.map((pendingId: IUserId) => UsersApi.getUserData(pendingId))
		)

		const filtered = pendingFriends.map(
			({
				user_id,
				username,
				avatar
			}: {
				user_id: number
				username: string
				avatar: string
			}) => ({
				user_id,
				username,
				avatar
			})
		)

		return { pendingFriends: filtered }
	}

	static async getPendingSentRequests(
		userId: IUserId
	): Promise<{ pendingFriends: PendingFriendsListDTO }> {
		const userExisted = await UsersApi.userExists(userId)
		if (!userExisted) throw new AppError(ERROR_MESSAGES.INVALID_USER_ID, 404)

		const pendingIds = SocialRepository.getPendingSentRequests(userId)
		const pendingSentRequests = await Promise.all(
			pendingIds.map((pendingId: IUserId) => UsersApi.getUserData(pendingId))
		)

		const filtered = pendingSentRequests.map(
			({
				user_id,
				username,
				avatar
			}: {
				user_id: number
				username: string
				avatar: string
			}) => ({
				user_id,
				username,
				avatar
			})
		)

		return { pendingFriends: filtered }
	}
}
