import { SocialRepository } from '../repositories/socialRepository.js'
import { IUserId, AppError, ERROR_MESSAGES } from '@ft_transcendence/common'
import { UsersApi } from '../repositories/UsersApi.js'

export class FriendService {
	static async sendFriendRequest(
		userId: IUserId,
		friendId: IUserId
	): Promise<void> {
		if (userId === friendId)
			throw new AppError(ERROR_MESSAGES.CANNOT_ADD_YOURSELF, 400)

		// verifier que le friend id existe
		const friendExisted = await UsersApi.userExists(friendId)
		if (!friendExisted)
			throw new AppError(ERROR_MESSAGES.INVALID_FRIEND_ID, 404)

		// verifier le statut de la relation
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
		// call la DB pour ajouter la relation
		SocialRepository.addRelation(userId, friendId, userId)

		// TODO: envoyer la notification

		return
	}

	static async acceptFriendRequest(
		userId: IUserId,
		friendId: IUserId
	): Promise<void> {
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
		const status = SocialRepository.getRelationStatus(userId, friendId)
		if (status !== 0) throw new AppError(ERROR_MESSAGES.NO_PENDING_REQUEST, 404)

		const originId = SocialRepository.getOriginId(userId, friendId)
		if (originId === userId.user_id)
			throw new AppError(ERROR_MESSAGES.CANNOT_CANCEL_YOURSELF, 400)

		SocialRepository.deleteRelation(userId, friendId)
	}

	static async removeFriend(userId: IUserId, friendId: IUserId): Promise<void> {
		const status = SocialRepository.getRelationStatus(userId, friendId)
		if (status !== 1) throw new AppError(ERROR_MESSAGES.NOT_FRIENDS, 400)

		SocialRepository.deleteRelation(userId, friendId)

		// TODO: notif ?
	}
}

/*
declineFriendRequest(userId, friendId) — check permissions + call deleteRelation()
removeFriend(userId, friendId) — check permissions + call deleteRelation()
getFriendsList(userId) — call findFriendsList()
getPendingRequests(userId) — call findPendingListToApprove() + findPendingSentRequests()
 */
