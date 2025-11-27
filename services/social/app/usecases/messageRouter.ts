import WebSocket from 'ws'

export interface Message {
	type: string
	data?: unknown
}

// TODO : switch case with websocket type convention

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

	if (messageType === 'message:echo') {
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
	} else if (messageType === 'friend:request') {
		// Handle friend request message
	} else
		console.warn(
			`⚠️ [MSG] Unknown message type from user ${userId}: ${messageType}`
		)
}
