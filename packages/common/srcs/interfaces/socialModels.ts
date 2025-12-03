export enum RelationStatus {
	PENDING = 0,
	FRIENDS = 1
}

export enum NotificationType {
	FriendRequest = 'friend:request',
	FriendAccept = 'friend:accept',
	FriendRemove = 'friend:remove',
	FriendReject = 'friend:reject',
	UserStatusChange = 'user:status-changed'
}

/**
 * Notification payload structure for WebSocket messages
 * Used in message routing and sending notifications
 * from = the user who triggered the notification
 * to = the user who receives the notification
 */
export interface NotificationPayload {
	type:
		| NotificationType.FriendAccept
		| NotificationType.FriendRemove
		| NotificationType.FriendRequest
		| NotificationType.FriendReject
	data: {
		from: {
			userId: number
			username: string
		}
		to?: {
			userId: number
			username?: string
		}
		timestamp: string
		message: string
		friendListUpdate?: {
			username: string
			avatarUrl: string
			status?: number
			lastSeen?: string
		}
	}
}

export interface StatusChangePayload {
	type: 'user:status-changed'
	data: {
		userId: number
		status: number
		timestamp: string
		lastSeen?: string
	}
}
