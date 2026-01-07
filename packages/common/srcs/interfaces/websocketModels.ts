export enum WSMessageType {
	CONNECTION_ESTABLISHED = 'connection:established',
	ERROR_OCCURRED = 'error:occurred',
	MESSAGE_ECHO = 'message:echo',
	FRIEND_REQUEST = 'friend:request',
	FRIEND_ACCEPT = 'friend:accept',
	FRIEND_REMOVE = 'friend:remove',
	FRIEND_REJECT = 'friend:reject',
	USER_STATUS_CHANGE = 'user:status-changed'
}

export enum WSCloseCodes {
	NORMAL = 'Normal Closure',
	GOING_AWAY = 'Going Away',
	PROTOCOL_ERROR = 'Protocol Error',
	UNSUPPORTED_DATA = 'Unsupported Data',
	NO_STATUS_RECEIVED = 'No Status Received',
	ABNORMAL_CLOSURE = 'Abnormal Closure',
	INVALID_FRAME_PAYLOAD_DATA = 'Invalid Frame Payload Data',
	POLICY_VIOLATION = 'Policy Violation',
	MESSAGE_TOO_LARGE = 'Message Too Large',
	MANDATORY_EXTENSION_MISSING = 'Mandatory Extension Missing',
	SERVER_ERROR = 'Server Error'
}

/**
 * Notification payload structure for WebSocket messages
 * Used in message routing and sending notifications
 * from = the user who triggered the notification
 * to = the user who receives the notification
 * friendListUpdate = updated friend info for recipient's friend list
 */
export interface NotificationPayload {
	type:
		| WSMessageType.FRIEND_ACCEPT
		| WSMessageType.FRIEND_REMOVE
		| WSMessageType.FRIEND_REQUEST
		| WSMessageType.FRIEND_REJECT
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
	type: WSMessageType.USER_STATUS_CHANGE
	data: {
		userId: number
		status: number
		timestamp: string
		lastSeen?: string
	}
}
