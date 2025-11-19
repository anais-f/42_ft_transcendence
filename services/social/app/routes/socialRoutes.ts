import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import { z } from 'zod'
import { createTokenController } from '../controllers/tokenControllers.js'
import { addConnection, getTotalConnections } from '../usescases/connectionManager.js'
import WebSocket from 'ws'

export const socialRoutes: FastifyPluginAsync = async (fastify) => {
	const server = fastify.withTypeProvider<ZodTypeProvider>()

	// POST /api/create-token - Create temporary WS token (JWT required)
	server.post(
		'/api/create-token',
		{
			preHandler: [jwtAuthMiddleware]
		},
		createTokenController
	)

	// WebSocket route - client must connect with: ws://<host>/api/ws?token=<wsToken>
	const wsQuerySchema = z.object({
		token: z.string().min(1, 'Token is required')
	})

	server.get(
		'/api/ws',
		{
			websocket: true,
			schema: {
				querystring: wsQuerySchema
			}
		},
		(
			socket: WebSocket,
			request: FastifyRequest<{ Querystring: { token: string } }>
		) => {
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

			// Add connection to manager
			// connectionManager va automatiquement :
			// - attacher les handlers (pong, close, error)
			// - notifier le service users que l'user est online
			addConnection(userId, socket).catch((error) => {
				const message = error instanceof Error ? error.message : String(error)
				console.error(`Failed to add connection for user ${userId}:`, message)
			})

			console.log(`✅ [WS] ${userLogin} (${userId}) connected`)
			console.log(
				`   Total: ${getTotalConnections()}`
			)

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
				console.log(
					`📨 [MSG] ${userLogin}: ${message.type || 'unknown'}`
				)

				// TODO: Route message to appropriate handler
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
			// Note: 'pong', 'close', and 'error' handlers are attached by connectionManager
		}
	)
}
