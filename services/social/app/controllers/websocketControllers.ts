import { FastifyRequest, FastifyInstance } from 'fastify'
import WebSocket from 'ws'
import { initializeConnection } from '../usecases/websocketService.js'
import { IWsJwtTokenQuery, WSMessageType } from '@ft_transcendence/common'
import { handleWsConnection } from '@ft_transcendence/security'

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
	setupCloseHandler(socket, userId, username)
}

/**
 * Setup message listener for incoming WebSocket messages
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
			JSON.parse(rawMessage)
		} catch (e) {
			const safe = rawMessage.replace(/\s+/g, ' ').trim().slice(0, 200)
			console.log(`[MSG] ${username}: ${safe}`)
			socket.send(
				JSON.stringify({
					type: WSMessageType.MESSAGE_ECHO,
					data: {
						from: {
							userId,
							login: username
						},
						content: safe
					}
				})
			)
			return
		}
	})
}

/**
 * Setup close listener for WebSocket disconnection
 * @param socket WebSocket connection
 * @param userId User ID
 * @param username Username
 */
function setupCloseHandler(
	socket: WebSocket,
	userId: number,
	username: string
): void {
	socket.on('close', () => {
		console.log(`[WS] ${username} (${userId}) disconnected`)
	})
}
