import { FastifyRequest, FastifyInstance } from 'fastify'
import WebSocket from 'ws'
import {
	addConnection,
	getTotalConnections
} from '../usecases/connectionManager.js'
import { routeMessage } from '../usecases/messageRouter.js'
import { UsersApi } from '../repositories/UsersApi.js'

// TODO : split into smaller functions when notifications are added and refactored logic after add connection
// rename la fonction en fonction de son role

/**
 * Handle WebSocket connection: verify token, setup connection, attach message handler
 * This is the ONLY place where WS logic lives - everything else is in services
 */
export async function handleWsConnection(
	socket: WebSocket,
	request: FastifyRequest<{ Querystring: { token: string } }>,
	fastify: FastifyInstance
): Promise<void> {
	const token = request.query.token
	const jwtInstance = (fastify as any).jwt

	// Verify and decode JWT token
	let payload: any
	try {
		payload = jwtInstance.verify(token)
	} catch (err) {
		socket.send(
			JSON.stringify({
				type: 'error:occurred',
				code: 'INVALID_TOKEN',
				message: 'Invalid or expired token'
			})
		)
		socket.close(1008, 'Authentication failed')
		return
	}

	const userId = payload.user_id
	const userLogin = payload.login

	// Add connection
	try {
		await addConnection(userId, socket)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(`Failed to add connection for user ${userId}:`, message)
		socket.close(1011, 'Internal server error')
		return
	}

	let username
	try {
		const userData = await UsersApi.getUserData({ user_id: userId })
		username = userData.username ?? userLogin
	} catch (error) {
		console.error(`Failed to fetch user data for user ${userId}:`, error)
		username = userLogin
	}

	console.log(`✅ [WS] ${username} (${userId}) connected`)
	console.log(`   Total: ${getTotalConnections()}`)

	// Send welcome message to client
	socket.send(
		JSON.stringify({
			type: 'connection:established',
			data: {
				userId,
				username,
				totalConnected: getTotalConnections(),
				timestamp: new Date().toISOString()
			}
		})
	)

	// Handle incoming messages from client, écoute et renvoie sur le router des messages
	socket.on('message', (rawData: WebSocket.Data) => {
		const rawMessage = rawData.toString()

		// Try to parse as JSON, fallback to plain text
		let message: any
		try {
			message = JSON.parse(rawMessage)
		} catch (e) {
			// Not JSON, treat as plain text message
			// Sanitize and truncate the raw message for safe logging
			const safe = rawMessage.replace(/\s+/g, ' ').trim().slice(0, 200)
			console.log(`📨 [MSG] ${username}: ${safe}`)
			socket.send(
				JSON.stringify({
					type: 'message:echo',
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

		// Valid JSON message - route to appropriate handler
		routeMessage(userId, message, socket)
	})

	socket.on('close', () => {
		console.log(`❌ [WS] ${username} (${userId}) disconnected`)
	})
}
