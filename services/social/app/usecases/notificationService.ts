import { NotificationPayload } from '@ft_transcendence/common'
import { sendToUser } from '../usecases/connectionManager.js'

export enum NotificationType {
	FriendRequest = 'friend:request',
	FriendAccept = 'friend:accept',
	FriendRemove = 'friend:remove',
	FriendReject = 'friend:reject'
}

const MessagesTemplates: Record<
	NotificationType,
	(username: string) => string
> = {
	[NotificationType.FriendRequest]: (username: string) =>
		`${username} has sent you a friend request.`,
	[NotificationType.FriendAccept]: (username: string) =>
		`${username} has accepted your friend request.`,
	[NotificationType.FriendRemove]: (username: string) =>
		`${username} has removed your friendship.`,
	[NotificationType.FriendReject]: (username: string) =>
		`${username} has rejected your friend request.`
}

/**
 * Send notification to a user
 * @param type
 * @param fromUserId
 * @param fromUsername
 * @param toUserId
 * @param friendInfo - Optional friend info to include in the friendListUpdate
 */
function sendFriendNotification(
	type: NotificationType,
	fromUserId: number,
	fromUsername: string,
	toUserId: number
): boolean {
	const notification: NotificationPayload = {
		type: type,
		data: {
			from: {
				userId: fromUserId,
				username: fromUsername
			},
			timestamp: new Date().toISOString(),
			message: MessagesTemplates[type](fromUsername)
		}
	}

	const sent = sendToUser(toUserId, notification)

	if (sent) {
		console.log(`${type} notification sent to ${toUserId}`)
	} else {
		console.log(`User ${toUserId} not connected, ${type} notification not sent`)
	}

	return sent
}

/**
 * Send friend request notification
 * @param fromUserId
 * @param fromUsername
 * @param toUserId
 */
export async function friendRequestNotification(
	fromUserId: number,
	fromUsername: string,
	toUserId: number
): Promise<boolean> {
	return sendFriendNotification(
		NotificationType.FriendRequest,
		fromUserId,
		fromUsername,
		toUserId
	)
}

/**
 * Send friend accepted notification
 * @param fromUserId
 * @param fromUsername
 * @param toUserId
 * @param friendInfo - Friend info to include in friendListUpdate
 */
export async function friendAcceptedNotification(
	fromUserId: number,
	fromUsername: string,
	toUserId: number
): Promise<boolean> {
	return sendFriendNotification(
		NotificationType.FriendAccept,
		fromUserId,
		fromUsername,
		toUserId
	)
}

/**
 * Send friend removed notification
 * @param fromUserId
 * @param fromUsername
 * @param toUserId
 */
export async function friendRemovedNotification(
	fromUserId: number,
	fromUsername: string,
	toUserId: number
): Promise<boolean> {
	return sendFriendNotification(
		NotificationType.FriendRemove,
		fromUserId,
		fromUsername,
		toUserId
	)
}

/**
 * Send friend rejected notification
 * @param fromUserId
 * @param fromUsername
 * @param toUserId
 */
export async function friendRejectedNotification(
	fromUserId: number,
	fromUsername: string,
	toUserId: number
): Promise<boolean> {
	return sendFriendNotification(
		NotificationType.FriendReject,
		fromUserId,
		fromUsername,
		toUserId
	)
}
