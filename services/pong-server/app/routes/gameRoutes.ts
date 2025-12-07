import '@fastify/websocket'
import WebSocket from 'ws'
import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import { createTokenController } from '@ft_transcendence/security'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { createTokenSchema, IWsJwtTokenQuery } from '@ft_transcendence/common'
import { handleGameWsConnection } from '../controllers/wsControllers'

export const gameRoutes: FastifyPluginAsync = async (fastify) => {
	const server = fastify.withTypeProvider<ZodTypeProvider>()

	server.route({
		method: 'POST',
		url: '/api/pong-server/create-token',
		preHandler: jwtAuthMiddleware,
		schema: {
			response: {
				200: createTokenSchema
			}
		},
		handler: createTokenController
	})

	server.register(async (fastify) => {
		fastify.get<IWsJwtTokenQuery>(
			'/api/pong-server/ws',
			{ websocket: true },
			(socket: WebSocket, request: FastifyRequest<IWsJwtTokenQuery>) =>
				handleGameWsConnection(socket, request, fastify)
		)
	})
}
