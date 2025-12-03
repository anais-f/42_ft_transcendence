import { sendToUser, broadcast } from './connectionManager.js'
import { SocialRepository } from '../repositories/socialRepository.js'
import {
	IUserId,
	UserStatus,
	StatusChangePayload,
	NotificationType
} from '@ft_transcendence/common'

/**
 * Broadcast a status change to all friends of a user
 * @param userId - User ID whose status changed
 * @param status - UserStatus enum value (ONLINE, OFFLINE)
 */
export async function broadcastStatusChangeToFriends(
	userId: number,
	status: UserStatus
): Promise<void> {
	try {
		const userIdObj: IUserId = { user_id: userId }

		const friends = SocialRepository.getFriendsList(userIdObj)

		const timestamp = new Date().toISOString()

		const payload: StatusChangePayload = {
			type: 'user:status-changed',
			data: {
				userId: userId,
				status: status,
				timestamp: timestamp,
				...(status === UserStatus.OFFLINE && { lastSeen: timestamp })
			}
		}

		let sentCount = 0
		for (const friend of friends) {
			const sent = sendToUser(friend.user_id, payload)
			if (sent) {
				sentCount++
			}
		}

		console.log(
			`[BROADCAST] Status change for user ${userId} sent to ${sentCount}/${friends.length} friends`
		)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(
			`[BROADCAST] Failed to broadcast status change for user ${userId}:`,
			message
		)
	}
}

/**
 * Broadcast presence change to all connected users (for public profiles, etc)
 * @param userId - User ID whose status changed
 * @param status - UserStatus enum value (ONLINE, OFFLINE)
 */
export async function broadcastPresenceToAll(
	userId: number,
	status: UserStatus
): Promise<void> {
	try {
		const timestamp = new Date().toISOString()

		const payload: StatusChangePayload = {
			type: 'user:status-changed',
			data: {
				userId: userId,
				status: status,
				timestamp: timestamp,
				...(status === UserStatus.OFFLINE && { lastSeen: timestamp })
			}
		}

		broadcast(payload)

		console.log(
			`[BROADCAST] Presence change for user ${userId} sent to all connected users`
		)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(
			`[BROADCAST] Failed to broadcast presence change for user ${userId}:`,
			message
		)
	}
}

// export async function broadcastFriendListChange(
// 	userId: string,
// 	targetUserId: string,
// 	action: NotificationType.FriendAccept | NotificationType.FriendReject | NotificationType.FriendRequest | NotificationType.FriendRemove,
// 	friendInfo?: { username: string; avatarUrl?: string }
// ): Promise<void> {
// 	try {
// 		const userIdNum = Number(userId)
// 		const targetUserIdNum = Number(targetUserId)
// 		const timestamp = new Date().toISOString()
//
// 		const payload: FriendListChangePayload = {
// 			type: 'user:friend-list-updated',
// 			data: {
// 				userId: userIdNum,
// 				targetUserId: targetUserIdNum,
// 				action: action,
// 				timestamp: timestamp,
// 				...(friendInfo && { friendInfo })
// 			}
// 		}
//
// 		sendToUser(targetUserId, payload)
// 		console.log(
// 			`[BROADCAST] Friend list change (${action}) for user ${userId} sent to user ${targetUserId}`
// 		)
// 	} catch (error) {
// 		const message = error instanceof Error ? error.message : String(error)
// 		console.error(
// 			`[BROADCAST] Failed to broadcast friend list change for user ${userId}:`,
// 			message
// 		)
// 	}
// }
