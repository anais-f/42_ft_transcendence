import { NotificationPayload, WSMessageType } from '@ft_transcendence/common'
import { sendToUser } from '../usecases/connectionManager.js'

const MessagesTemplates: Record<
	| WSMessageType.FRIEND_ACCEPT
	| WSMessageType.FRIEND_REJECT
	| WSMessageType.FRIEND_REQUEST
	| WSMessageType.FRIEND_REMOVE,
	(username: string) => string
> = {
	[WSMessageType.FRIEND_REQUEST]: (username: string) =>
		`${username} has sent you a friend request.`,
	[WSMessageType.FRIEND_ACCEPT]: (username: string) =>
		`${username} has accepted your friend request.`,
	[WSMessageType.FRIEND_REMOVE]: (username: string) =>
		`${username} has removed your friendship.`,
	[WSMessageType.FRIEND_REJECT]: (username: string) =>
		`${username} has rejected your friend request.`
}

function sendFriendNotification(
	type:
		| WSMessageType.FRIEND_ACCEPT
		| WSMessageType.FRIEND_REJECT
		| WSMessageType.FRIEND_REQUEST
		| WSMessageType.FRIEND_REMOVE,
	fromUserId: number,
	fromUsername: string,
	toUserId: number,
	friendInfo?: {
		username: string
		avatarUrl: string
		status?: number
		lastSeen?: string
	}
): boolean {
	const notification = {
		type: type,
		data: {
			from: {
				userId: fromUserId,
				username: fromUsername
			},
			timestamp: new Date().toISOString(),
			message: MessagesTemplates[type](fromUsername)
		}
	} as NotificationPayload

	if (friendInfo) notification.data.friendListUpdate = friendInfo

	const sent = sendToUser(toUserId, notification)

	return sent
}

export async function friendRequestNotification(
	fromUserId: number,
	fromUsername: string,
	toUserId: number,
	friendInfo?: {
		username: string
		avatarUrl: string
		status?: number
		lastSeen?: string
	}
): Promise<boolean> {
	return sendFriendNotification(
		WSMessageType.FRIEND_REQUEST,
		fromUserId,
		fromUsername,
		toUserId,
		friendInfo
	)
}

export async function friendAcceptedNotification(
	fromUserId: number,
	fromUsername: string,
	toUserId: number,
	friendInfo?: {
		username: string
		avatarUrl: string
		status?: number
		lastSeen?: string
	}
): Promise<boolean> {
	return sendFriendNotification(
		WSMessageType.FRIEND_ACCEPT,
		fromUserId,
		fromUsername,
		toUserId,
		friendInfo
	)
}

export async function friendRemovedNotification(
	fromUserId: number,
	fromUsername: string,
	toUserId: number
): Promise<boolean> {
	return sendFriendNotification(
		WSMessageType.FRIEND_REMOVE,
		fromUserId,
		fromUsername,
		toUserId
	)
}

export async function friendRejectedNotification(
	fromUserId: number,
	fromUsername: string,
	toUserId: number
): Promise<boolean> {
	return sendFriendNotification(
		WSMessageType.FRIEND_REJECT,
		fromUserId,
		fromUsername,
		toUserId
	)
}
