import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import { z } from 'zod'
import { createTokenController } from '../controllers/tokenControllers.js'
import { handleWsConnection } from '../controllers/websocketControllers.js'
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
		(socket: WebSocket, request: FastifyRequest<{ Querystring: { token: string } }>) =>
			handleWsConnection(socket, request, fastify)
	)
}
