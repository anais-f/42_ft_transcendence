import { FastifyRequest, FastifyInstance } from 'fastify'
import WebSocket from 'ws'
import { addConnection, getTotalConnections } from '../usescases/connectionStore.js'
import { handleUserOnline, handleUserOffline } from '../usescases/presenceService.js'

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
				type: 'error',
				code: 'INVALID_TOKEN',
				message: 'Invalid or expired token'
			})
		)
		socket.close(1008, 'Authentication failed')
		return
	}

	const userId = String(payload.user_id)
	const userLogin = String(payload.login)

	// Add connection to store with offline handler
	try {
		addConnection(userId, socket, (uid, ws) => {
			handleUserOffline(uid)
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(`Failed to add connection for user ${userId}:`, message)
		socket.close(1011, 'Internal server error')
		return
	}

	// Notify users service that user is online
	try {
		await handleUserOnline(userId)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(`Failed to handle user online for ${userId}:`, message)
	}

	console.log(`✅ [WS] ${userLogin} (${userId}) connected`)
	console.log(`   Total: ${getTotalConnections()}`)

	// Send welcome message
	socket.send(
		JSON.stringify({
			type: 'connection:established',
			data: {
				userId,
				login: userLogin,
				totalConnected: getTotalConnections(),
				timestamp: new Date().toISOString()
			}
		})
	)

	// Handle incoming messages from client
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
			console.log(`📨 [MSG] ${userLogin}: ${safe}`)
			socket.send(
				JSON.stringify({
					type: 'message:echo',
					data: {
						from: {
							userId,
							login: userLogin
						},
						content: rawMessage
					}
				})
			)
			return
		}

		// Valid JSON message
		console.log(`📨 [MSG] ${userLogin}: ${message.type || 'unknown'}`)

		// TODO: Route message to appropriate handler via messageRouter
		// For now, just echo back
		socket.send(
			JSON.stringify({
				type: 'message:echo',
				data: {
					from: {
						userId,
						login: userLogin
					},
					content: message
				}
			})
		)
	})
}
