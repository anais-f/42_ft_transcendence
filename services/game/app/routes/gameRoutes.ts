import '@fastify/websocket'
import WebSocket from 'ws'
import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import {
	CodeParamSchema,
	createTokenSchema,
	CreateGameSchema,
	IWsJwtTokenQuery
} from '@ft_transcendence/common'
import { handleGameWsConnection } from '../controllers/game/wsControllers.js'
import { createNewGameController } from '../controllers/game/newGameController.js'
import { joinGameController } from '../controllers/game/joinGameController.js'
import { getAssignedGameController } from '../controllers/game/getAssignedGameController.js'

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
			body: CreateGameSchema,
			response: {
				201: CodeParamSchema
			}
		},
		handler: createNewGameController
	})

	server.route({
		method: 'GET',
		url: '/api/game/assigned',
		preHandler: jwtAuthMiddleware,
		schema: {
			response: {
				200: CodeParamSchema
			}
		},
		handler: getAssignedGameController
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
