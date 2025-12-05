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
	NORMAL = 'Normal Closure', //1000
	GOING_AWAY = 'Going Away', //1001
	PROTOCOL_ERROR = 'Protocol Error', //1002
	UNSUPPORTED_DATA = 'Unsupported Data', //1003
	NO_STATUS_RECEIVED = 'No Status Received', //1005
	ABNORMAL_CLOSURE = 'Abnormal Closure', //1006
	INVALID_FRAME_PAYLOAD_DATA = 'Invalid Frame Payload Data', //1007
	POLICY_VIOLATION = 'Policy Violation', //1008
	MESSAGE_TOO_LARGE = 'Message Too Large', //1009
	MANDATORY_EXTENSION_MISSING = 'Mandatory Extension Missing', //1010
	SERVER_ERROR = 'Server Error' //1011
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

/**
 * Payload structure for user status change messages
 * Sent when a user changes their online/offline status
 */
export interface StatusChangePayload {
	type: WSMessageType.USER_STATUS_CHANGE
	data: {
		userId: number
		status: number
		timestamp: string
		lastSeen?: string
	}
}
