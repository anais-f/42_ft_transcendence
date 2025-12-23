import { SocialRepository } from '../repositories/socialRepository.js'
import {
	IUserId,
	IPublicProfileUser,
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
import createHttpError from 'http-errors'

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
			throw createHttpError.BadRequest('Cannot add yourself as a friend')

		const friendExisted = await UsersApi.userExists(friendId)
		if (!friendExisted) throw createHttpError.NotFound('Invalid friend ID')

		const existingRelation = SocialRepository.getRelationStatus(
			userId,
			friendId
		)
		if (existingRelation === RelationStatus.FRIENDS)
			throw createHttpError.BadRequest('Relation already exists')

		if (existingRelation === RelationStatus.PENDING) {
			const originId = SocialRepository.getOriginId(userId, friendId)
			if (originId === userId.user_id)
				throw createHttpError.BadRequest('Friend request already sent')
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
			throw createHttpError.BadRequest('Cannot accept yourself as a friend')

		const friendExisted = await UsersApi.userExists(friendId)
		if (!friendExisted) throw createHttpError.NotFound('Invalid friend ID')

		const status = SocialRepository.getRelationStatus(userId, friendId)
		if (status === -1)
			throw createHttpError.NotFound('No pending friend request')
		if (status === RelationStatus.FRIENDS)
			throw createHttpError.BadRequest('Relation already exists')

		const originId = SocialRepository.getOriginId(userId, friendId)
		if (originId === userId.user_id)
			throw createHttpError.BadRequest('Cannot accept yourself as a friend')

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
			throw createHttpError.BadRequest('Cannot reject yourself as a friend')

		const friendExisted = await UsersApi.userExists(friendId)
		if (!friendExisted) throw createHttpError.NotFound('Invalid friend ID')

		const status = SocialRepository.getRelationStatus(userId, friendId)
		if (status !== RelationStatus.PENDING)
			throw createHttpError.NotFound('No pending friend request')

		const originId = SocialRepository.getOriginId(userId, friendId)
		if (originId === userId.user_id)
			throw createHttpError.BadRequest('Cannot reject yourself as a friend')

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
			throw createHttpError.BadRequest('Cannot cancel yourself as a friend')

		const friendExisted = await UsersApi.userExists(friendId)
		if (!friendExisted) throw createHttpError.NotFound('Invalid friend ID')

		const status = SocialRepository.getRelationStatus(userId, friendId)
		if (status !== RelationStatus.PENDING)
			throw createHttpError.NotFound('No pending friend request')

		const originId = SocialRepository.getOriginId(userId, friendId)
		if (originId !== userId.user_id)
			throw createHttpError.BadRequest('Cannot cancel yourself as a friend')

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
			throw createHttpError.BadRequest('Cannot remove yourself as a friend')

		const friendExisted = await UsersApi.userExists(friendId)
		if (!friendExisted) throw createHttpError.NotFound('Invalid friend ID')

		const status = SocialRepository.getRelationStatus(userId, friendId)
		if (status !== RelationStatus.FRIENDS)
			throw createHttpError.BadRequest('You are not friends')

		SocialRepository.deleteRelation(userId, friendId)
		await sendNotification(userId, friendId, friendRemovedNotification)
	}

	/**
	 * Get the friends list for a user
	 * @param userId
	 * @return IPublicProfileUser[]
	 */
	static async getFriendsList(userId: IUserId): Promise<IPublicProfileUser[]> {
		const userExisted = await UsersApi.userExists(userId)
		if (!userExisted) throw createHttpError.NotFound('Invalid user ID')

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
		if (!userExisted) throw createHttpError.NotFound('Invalid user ID')

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
		if (!userExisted) throw createHttpError.NotFound('Invalid user ID')

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
