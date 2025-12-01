import { sendToUser } from './connectionManager.js'
import { SocialRepository } from '../repositories/socialRepository.js'
import { IUserId, UserStatus } from '@ft_transcendence/common'

interface StatusChangePayload {
	type: 'friend:status-changed'
	data: {
		userId: number
		status: number
		timestamp: string
	}
}

/**
 * Broadcast a status change to all friends of a user
 * @param userId - User ID whose status changed
 * @param status - UserStatus enum value (ONLINE, OFFLINE, or BUSY)
 */
export async function broadcastStatusChangeToFriends(
	userId: string,
	status: UserStatus,
): Promise<void> {

	try {
		const userIdNum = Number(userId)
		const userIdObj: IUserId = { user_id: userIdNum }

		const friends = SocialRepository.getFriendsList(userIdObj)

		const statusValue = status

		const payload: StatusChangePayload = {
			type: 'friend:status-changed',
			data: {
				userId: userIdNum,
				status: statusValue,
				timestamp: new Date().toISOString()
			}
		}

		let sentCount = 0
		for (const friend of friends) {
			const sent = sendToUser(String(friend.user_id), payload)
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
