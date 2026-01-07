import { broadcast, sendToUser } from './connectionManager.js'
import { SocialRepository } from '../repositories/socialRepository.js'
import {
	IUserId,
	StatusChangePayload,
	UserStatus,
	WSMessageType
} from '@ft_transcendence/common'

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
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
	}
}
