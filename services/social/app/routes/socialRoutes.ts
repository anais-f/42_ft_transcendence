import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import { z } from 'zod'
import { createTokenController } from '../controllers/websocketControllers.js'
import { addConnection, getTotalConnections } from '../usescases/connectionManager.js'
import WebSocket from 'ws'

export const socialRoutes: FastifyPluginAsync = async (fastify) => {
	const server = fastify.withTypeProvider<ZodTypeProvider>()

	// POST /api/create-token - Create temporary WS token (JWT required)
	server.post(
		'/api/create-token',
		{
			preHandler: jwtAuthMiddleware
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
			const isFirstConnection = addConnection(userId, socket)

			console.log(`✅ [WS] ${userLogin} (${userId}) connected`)
			console.log(
				`   First: ${isFirstConnection} | Total: ${getTotalConnections()}`
			)

			// Send welcome message
			socket.send(
				JSON.stringify({
					type: 'connection:established',
					data: {
						userId,
						login: userLogin,
						isFirstConnection,
						totalConnected: getTotalConnections(),
						timestamp: new Date().toISOString()
					}
				})
			)

			// Handle incoming messages from client
			socket.on('message', (rawData: WebSocket.Data) => {
				try {
					const message = JSON.parse(rawData.toString())
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
				} catch (e) {
					const message = e instanceof Error ? e.message : String(e)
					console.warn(
						`[MSG] Error parsing message from ${userLogin}: ${message}`
					)
					socket.send(
						JSON.stringify({
							type: 'error',
							code: 'INVALID_MESSAGE',
							message: 'Invalid message format'
						})
					)
				}
			})
			// Note: 'pong', 'close', and 'error' handlers are attached by connectionManager
		}
	)
}
