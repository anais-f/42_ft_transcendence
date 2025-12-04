import {broadcast, sendToUser} from './connectionManager.js'
import {SocialRepository} from '../repositories/socialRepository.js'
import {IUserId, StatusChangePayload, UserStatus} from '@ft_transcendence/common'
import {WSMessageType} from "@packages/common/srcs/interfaces/websocketModels.js";

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

		const payload = {
			type: WSMessageType.USER_STATUS_CHANGE,
			data: {
				userId: userId,
				status: status,
				timestamp: timestamp,
				...(status === UserStatus.OFFLINE && { lastSeen: timestamp })
			}
		} as StatusChangePayload

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

		const payload = {
			type: WSMessageType.USER_STATUS_CHANGE,
			data: {
				userId: userId,
				status: status,
				timestamp: timestamp,
				...(status === UserStatus.OFFLINE && { lastSeen: timestamp })
			}
		} as StatusChangePayload

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
