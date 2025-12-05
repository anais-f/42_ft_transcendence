import { SocialRepository } from '../repositories/socialRepository.js'
import {
	IUserId,
	AppError,
	ERROR_MESSAGES,
	IPrivateUser,
	PendingFriendsListDTO,
	RelationStatus
} from '@ft_transcendence/common'
import { UsersApi } from '../repositories/UsersApi.js'
import {
	friendRequestNotification,
	friendAcceptedNotification,
	friendRejectedNotification,
	friendRemovedNotification
} from './notificationService.js'

/**
 * Send a notification using the provided notify function
 * @param userId
 * @param friendId
 * @param notifyFn
 */
async function sendNotification(
	userId: IUserId,
	friendId: IUserId,
	notifyFn: (
		fromUserId: number,
		fromUsername: string,
		toUserId: number,
		friendInfo?: {
			username: string
			avatarUrl: string
			status?: number
			lastSeen?: string
		}
	) => Promise<boolean>
): Promise<boolean> {
	try {
		const userData = await UsersApi.getUserData(userId)

		const fromUsername = userData?.username ?? 'Unknown'
		const friendInfo = {
			username: userData?.username ?? 'Unknown',
			avatarUrl: userData?.avatar ?? '',
			status: userData?.status,
			lastSeen: userData?.last_connection
		}

		const isFriendshipUpdate =
			notifyFn === friendAcceptedNotification ||
			notifyFn === friendRemovedNotification

		const sent = await notifyFn(
			userId.user_id,
			fromUsername,
			friendId.user_id,
			isFriendshipUpdate ? friendInfo : undefined
		)
		if (!sent) {
			console.log(
				`User ${friendId.user_id}, ${fromUsername}, not connected, notification not sent`
			)
		}

		return sent
	} catch (error) {
		console.log('Failed to send notification:', error)
		return false
	}
}

export class FriendService {
	/**
	 * Send a friend request from userId to friendId
	 * If a pending request exists from friendId to userId, accept it instead
	 * @param userId
	 * @param friendId
	 * @return void
	 */
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
		if (existingRelation === RelationStatus.FRIENDS)
			throw new AppError(ERROR_MESSAGES.RELATION_ALREADY_EXISTS, 400)

		if (existingRelation === RelationStatus.PENDING) {
			const originId = SocialRepository.getOriginId(userId, friendId)
			if (originId === userId.user_id)
				throw new AppError(ERROR_MESSAGES.REQUEST_ALREADY_SENT, 400)
			else {
				SocialRepository.updateRelationStatus(
					userId,
					friendId,
					RelationStatus.FRIENDS
				)

				await sendNotification(userId, friendId, friendAcceptedNotification)
				await sendNotification(friendId, userId, friendAcceptedNotification)
				return
			}
		}

		SocialRepository.addRelation(userId, friendId, userId)

		await sendNotification(userId, friendId, friendRequestNotification)

		return
	}

	/**
	 * Accept a friend request from friendId to userId
	 * @param userId
	 * @param friendId
	 * @return void
	 */
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
		if (status === RelationStatus.FRIENDS)
			throw new AppError(ERROR_MESSAGES.RELATION_ALREADY_EXISTS, 400)

		const originId = SocialRepository.getOriginId(userId, friendId)
		if (originId === userId.user_id)
			throw new AppError(ERROR_MESSAGES.CANNOT_ACCEPT_YOURSELF, 400)

		SocialRepository.updateRelationStatus(userId, friendId, 1)
		await sendNotification(userId, friendId, friendAcceptedNotification)
	}

	/**
	 * Reject a friend request from friendId to userId
	 * @param userId
	 * @param friendId
	 * @return void
	 */
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
		if (status !== RelationStatus.PENDING)
			throw new AppError(ERROR_MESSAGES.NO_PENDING_REQUEST, 404)

		const originId = SocialRepository.getOriginId(userId, friendId)
		if (originId === userId.user_id)
			throw new AppError(ERROR_MESSAGES.CANNOT_REJECT_YOURSELF, 400)

		SocialRepository.deleteRelation(userId, friendId)
		await sendNotification(userId, friendId, friendRejectedNotification)
	}

	/**
	 * Cancel a sent friend request from userId to friendId
	 * @param userId
	 * @param friendId
	 * @return void
	 */
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
		if (status !== RelationStatus.PENDING)
			throw new AppError(ERROR_MESSAGES.NO_PENDING_REQUEST, 404)

		const originId = SocialRepository.getOriginId(userId, friendId)
		if (originId !== userId.user_id)
			throw new AppError(ERROR_MESSAGES.CANNOT_CANCEL_YOURSELF, 400)

		SocialRepository.deleteRelation(userId, friendId)
	}

	/**
	 * Remove a friend relationship between userId and friendId
	 * @param userId
	 * @param friendId
	 * @return void
	 */
	static async removeFriend(userId: IUserId, friendId: IUserId): Promise<void> {
		if (userId.user_id === friendId.user_id)
			throw new AppError(ERROR_MESSAGES.CANNOT_DELETE_YOURSELF, 400)

		const friendExisted = await UsersApi.userExists(friendId)
		if (!friendExisted)
			throw new AppError(ERROR_MESSAGES.INVALID_FRIEND_ID, 404)

		const status = SocialRepository.getRelationStatus(userId, friendId)
		if (status !== RelationStatus.FRIENDS)
			throw new AppError(ERROR_MESSAGES.NOT_FRIENDS, 400)

		SocialRepository.deleteRelation(userId, friendId)
		await sendNotification(userId, friendId, friendRemovedNotification)
	}

	/**
	 * Get the friends list for a user
	 * @param userId
	 * @return IPrivateUser[]
	 */
	static async getFriendsList(userId: IUserId): Promise<IPrivateUser[]> {
		const userExisted = await UsersApi.userExists(userId)
		if (!userExisted) throw new AppError(ERROR_MESSAGES.INVALID_USER_ID, 404)

		const friendIds = SocialRepository.getFriendsList(userId)
		return await Promise.all(
			friendIds.map((friendId) => UsersApi.getUserData(friendId))
		)
	}

	/**
	 * Get pending friend requests for a user
	 * @param userId
	 * @return PendingFriendsListDTO
	 */
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
