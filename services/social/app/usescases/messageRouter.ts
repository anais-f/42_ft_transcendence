import WebSocket from 'ws'

export interface Message {
	type: string
	data?: unknown
}

// TODO : TOUT REVOIR
/**
 * Route incoming messages to appropriate handlers
 * @param userId - User ID
 * @param message - Parsed message object
 * @param socket - WebSocket instance
 */
export async function routeMessage(
	userId: string,
	message: Message,
	socket: WebSocket
): Promise<void> {
	const messageType = message.type?.toLowerCase() || 'unknown'

	console.log(`📨 [MSG] User ${userId}: ${messageType}`)

	// Route by message type prefix
	if (messageType.startsWith('presence:')) {
		// TODO: Route to presence handlers
		// await handlePresenceMessage(userId, message, socket)
	} else if (messageType.startsWith('friend:')) {
		// TODO: Route to friend handlers
		// await handleFriendMessage(userId, message, socket)
	} else if (messageType.startsWith('invite:')) {
		// TODO: Route to invitation handlers
		// await handleInvitationMessage(userId, message, socket)
	} else if (messageType.startsWith('notify:')) {
		// TODO: Route to notification handlers
		// await handleNotificationMessage(userId, message, socket)
	} else {
		// Default: echo back
		socket.send(
			JSON.stringify({
				type: 'message:echo',
				data: {
					from: {
						userId
					},
					content: message
				}
			})
		)
	}
}
