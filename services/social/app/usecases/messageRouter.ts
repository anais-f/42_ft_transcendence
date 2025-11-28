import WebSocket from 'ws'
import { sendToUser } from '../usecases/connectionManager.js'
import { NotificationPayload } from '@ft_transcendence/common'

// TODO : switch case with websocket type convention
// maybe pour les invit de game

/**
 * Route incoming messages to appropriate handlers
 * @param userId - User ID
 * @param message - Parsed message object
 * @param socket - WebSocket instance
 */
export async function routeMessage(
	userId: string,
	message: NotificationPayload,
	socket: WebSocket
): Promise<void> {
	const messageType = message.type?.toLowerCase() || 'unknown'

	// console.log(`📨 [MSG] User ${userId}: ${messageType}`)

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
	} else
		console.warn(
			`⚠️ [MSG] Unknown message type from user ${userId}: ${messageType}`
		)
}
