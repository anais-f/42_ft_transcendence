export enum RelationStatus {
	PENDING = 0,
	FRIENDS = 1
}

/**
 * Notification payload structure for WebSocket messages
 * Used in message routing and sending notifications
 */
export interface NotificationPayload {
	type: string
	data: {
		from: {
			userId: string
			username?: string
		}
		to?: {
			userId: string
			username: string
		}
		timestamp: string
		message: string
	}
}
