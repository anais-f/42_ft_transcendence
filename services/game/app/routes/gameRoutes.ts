import '@fastify/websocket'
import WebSocket from 'ws'
import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import {
	createTokenSchema,
	IWsJwtTokenQuery,
	gameCodeSchema
} from '@ft_transcendence/common'
import { handleGameWsConnection } from '../controllers/wsControllers'
import { createNewGameController } from '../controllers/newGameController'
import { joinGameController } from '../controllers/joinGameController'

export const gameRoutes: FastifyPluginAsync = async (fastify) => {
	const server = fastify.withTypeProvider<ZodTypeProvider>()

	server.route({
		method: 'POST',
		url: '/api/game/join-game/:gameID',
		preHandler: jwtAuthMiddleware,
		schema: {
			params: gameCodeSchema,
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
				201: gameCodeSchema
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
