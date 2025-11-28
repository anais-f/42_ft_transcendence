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
import { NotificationService } from './notificationService.js'

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
		if (existingRelation === RelationStatus.FRIENDS)
			throw new AppError(ERROR_MESSAGES.RELATION_ALREADY_EXISTS, 400)

		if (existingRelation === RelationStatus.PENDING) {
			const originId = SocialRepository.getOriginId(userId, friendId)
			if (originId === userId.user_id)
				throw new AppError(ERROR_MESSAGES.REQUEST_ALREADY_SENT, 400)
			else {
				await SocialRepository.updateRelationStatus(
					userId,
					friendId,
					RelationStatus.FRIENDS
				)
				try {
					const userData = await UsersApi.getUserData(userId)
					const friendData = await UsersApi.getUserData(friendId)

					const fromUserUsername = userData?.username ?? 'Unknown'
					const fromFriendUsername = friendData?.username ?? 'Unknown'

					const sentToUser = await NotificationService.friendAccepted(
						String(userId.user_id),
						fromUserUsername,
						String(friendId.user_id)
					)
					if (!sentToUser) {
						console.log(
							`User ${String(friendId.user_id)}, ${fromUserUsername}, not connected, notification not sent FRIEND`
						)
					}

					const sentToFriend = await NotificationService.friendAccepted(
						String(friendId.user_id),
						fromFriendUsername,
						String(userId.user_id)
					)
					if (!sentToFriend) {
						console.log(
							`User ${String(userId.user_id)}, ${fromFriendUsername}, not connected, notification not sent FRIEND`
						)
					}
				} catch (error) {
					console.log('Failed to send friend accepted notification:', error)
				}
				return
			}
		}

		SocialRepository.addRelation(userId, friendId, userId)

		try {
			const userData = await UsersApi.getUserData(userId)
			const fromUsername = userData?.username ?? 'Unknown'
			const sent = await NotificationService.friendRequest(
				String(userId.user_id),
				fromUsername,
				String(friendId.user_id)
			)
			if (!sent) {
				console.log(
					`User ${String(friendId.user_id)}, ${fromUsername}, not connected, notification not sent FRIEND`
				)
			}
		} catch (error) {
			console.log('Failed to send friend request notification:', error)
		}

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
		if (status === RelationStatus.FRIENDS)
			throw new AppError(ERROR_MESSAGES.RELATION_ALREADY_EXISTS, 400)

		const originId = SocialRepository.getOriginId(userId, friendId)
		if (originId === userId.user_id)
			throw new AppError(ERROR_MESSAGES.CANNOT_ACCEPT_YOURSELF, 400)

		SocialRepository.updateRelationStatus(userId, friendId, 1)

		try {
			const userData = await UsersApi.getUserData(userId)
			const fromUsername = userData?.username ?? 'Unknown'
			const sent = await NotificationService.friendAccepted(
				String(userId.user_id),
				fromUsername,
				String(friendId.user_id)
			)
			if (!sent) {
				console.log(
					`User ${String(friendId.user_id)}, ${fromUsername}, not connected, notification not sent FRIEND`
				)
			}
		} catch (error) {
			console.log('Failed to send friend request notification:', error)
		}
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
		if (status !== RelationStatus.PENDING)
			throw new AppError(ERROR_MESSAGES.NO_PENDING_REQUEST, 404)

		const originId = SocialRepository.getOriginId(userId, friendId)
		if (originId === userId.user_id)
			throw new AppError(ERROR_MESSAGES.CANNOT_REJECT_YOURSELF, 400)

		SocialRepository.deleteRelation(userId, friendId)

		try {
			const userData = await UsersApi.getUserData(userId)
			const fromUsername = userData?.username ?? 'Unknown'
			const sent = await NotificationService.friendRejected(
				String(userId.user_id),
				fromUsername,
				String(friendId.user_id)
			)
			if (!sent) {
				console.log(
					`User ${String(friendId.user_id)}, ${fromUsername}, not connected, notification not sent FRIEND`
				)
			}
		} catch (error) {
			console.log('Failed to send friend request notification:', error)
		}
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
		if (status !== RelationStatus.PENDING)
			throw new AppError(ERROR_MESSAGES.NO_PENDING_REQUEST, 404)

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
		if (status !== RelationStatus.FRIENDS)
			throw new AppError(ERROR_MESSAGES.NOT_FRIENDS, 400)

		SocialRepository.deleteRelation(userId, friendId)

		try {
			const userData = await UsersApi.getUserData(userId)
			const fromUsername = userData?.username ?? 'Unknown'
			const sent = await NotificationService.friendRemoved(
				String(userId.user_id),
				fromUsername,
				String(friendId.user_id)
			)
			if (!sent) {
				console.log(
					`User ${String(friendId.user_id)}, ${fromUsername}, not connected, notification not sent FRIEND`
				)
			}
		} catch (error) {
			console.log('Failed to send friend request notification:', error)
		}
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
