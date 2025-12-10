import '@fastify/websocket'
import WebSocket from 'ws'
import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import {
    CodeParamSchema,
	createTokenSchema,
	IWsJwtTokenQuery,
} from '@ft_transcendence/common'
import { handleGameWsConnection } from '../controllers/wsControllers.js'
import { createNewGameController } from '../controllers/newGameController.js'
import { joinGameController } from '../controllers/joinGameController.js'

export const gameRoutes: FastifyPluginAsync = async (fastify) => {
	const server = fastify.withTypeProvider<ZodTypeProvider>()

	server.route({
		method: 'POST',
		url: '/api/game/join-game/:code',
		preHandler: jwtAuthMiddleware,
		schema: {
			params: CodeParamSchema,
			response: {
				201: createTokenSchema
			}
		},
		handler: joinGameController
	})

	server.route({
		method: 'POST',
		url: '/api/game/new-game',
		preHandler: jwtAuthMiddleware,
		schema: {
			response: {
				201: CodeParamSchema
			}
		},
		handler: createNewGameController
	})

	server.register(async (fastify) => {
		fastify.get<IWsJwtTokenQuery>(
			'/api/game/ws',
			{ websocket: true },
			(socket: WebSocket, request: FastifyRequest<IWsJwtTokenQuery>) =>
				handleGameWsConnection(socket, request, fastify)
		)
	})
}
