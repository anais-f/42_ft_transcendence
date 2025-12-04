import { FastifyRequest, FastifyInstance } from 'fastify'
import WebSocket from 'ws'
import { initializeConnection } from '../usecases/websocketService.js'
import { WSMessageType } from '@ft_transcendence/common'
import { WSCloseCodes } from '@packages/common/srcs/interfaces/websocketModels.js'

/**
 * Handle WebSocket connection: verify token, setup connection, attach message handler
 * This is the ONLY place where WS logic lives - everything else is in services
 */
export async function handleSocialWSConnection(
	socket: WebSocket,
	request: FastifyRequest<{ Querystring: { token: string } }>,
	fastify: FastifyInstance
): Promise<void> {
	const token = request.query.token
	const jwtInstance = (fastify as any).jwt

	let payload: any
	try {
		payload = jwtInstance.verify(token)
	} catch (err) {
		socket.send(
			JSON.stringify({
				type: WSMessageType.ERROR_OCCURRED,
				code: 'INVALID_TOKEN',
				message: 'Invalid or expired token'
			})
		)
		socket.close(
			1008,
			WSCloseCodes.POLICY_VIOLATION + ': Invalid or expired token'
		)
		return
	}

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
