import { FastifyRequest, FastifyInstance } from 'fastify'
import WebSocket from 'ws'
import { initializeConnection } from '../usecases/websocketService.js'
import { IWsJwtTokenQuery, WSMessageType } from '@ft_transcendence/common'
import { handleWsConnection } from '@ft_transcendence/security'
import {
	WSMessageType,
	WSCloseCodes,
	IJwtPayload
} from '@ft_transcendence/common'

/**
 * Handle WebSocket connection: verify token, setup connection, attach message handler
 * This is the ONLY place where WS logic lives - everything else is in services
 */
export async function handleSocialWSConnection(
	socket: WebSocket,
	request: FastifyRequest<IWsJwtTokenQuery>,
	fastify: FastifyInstance
): Promise<void> {
	let payload = await handleWsConnection(socket, request, fastify)
	if (!payload) return

	const userId = payload.user_id
	const userLogin = payload.login

	let username: string
	try {
		const result = await initializeConnection(socket, userId, userLogin)
		username = result.username
	} catch (error) {
		return
	}

	setupMessageHandler(socket, userId, username)
}

/**
 * Setup message listener for incoming WebSocket messages
 * TODO: Currently a placeholder - implement message handling logic if needed
 * For now, WebSocket is used for server->client notifications only
 * @param socket WebSocket connection
 * @param userId User ID
 * @param username Username
 */
function setupMessageHandler(
	socket: WebSocket,
	userId: number,
	username: string
): void {
	socket.on('message', (rawData: WebSocket.Data) => {
		const rawMessage = rawData.toString()

		try {
			const message = JSON.parse(rawMessage)
			console.log(`[WS] Valid JSON command from ${username}:`, message)
			// TODO: Add Zod validation and implement message routing
		} catch (e) {
			console.warn(`[WS] Invalid message from ${username}, rejected`)
			socket.send(
				JSON.stringify({
					type: WSMessageType.ERROR_OCCURRED,
					code: 'INVALID_FORMAT',
					message: 'Only JSON messages are accepted'
				})
			)
		}
	})
}
