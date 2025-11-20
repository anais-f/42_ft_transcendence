import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import { z } from 'zod'
import { createTokenController } from '../controllers/tokenControllers.js'
import { handleWsConnection } from '../controllers/websocketControllers.js'
import { handleLogout } from '../controllers/logoutControllers.js'
import WebSocket from 'ws'
import {
	ErrorResponseSchema,
	SuccessResponseSchema
} from '@ft_transcendence/common'

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
		) => handleWsConnection(socket, request, fastify)
	)

	// POST /api/logout/:userId - Mark user as offline (JWT required, can only logout self)
	server.post(
		'/api/logout/:userId',
		{
			schema: {
				params: z.object({ userId: z.coerce.number().int().positive().min(1) }),
				response: {
					200: SuccessResponseSchema,
					400: ErrorResponseSchema,
					401: ErrorResponseSchema,
					403: ErrorResponseSchema,
					500: ErrorResponseSchema
				}
			},
			preHandler: [jwtAuthMiddleware]
		},
		handleLogout
	)
}
