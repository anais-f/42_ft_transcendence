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
		url: '/api/pong-server/join-game/:gameID',
		preHandler: jwtAuthMiddleware,
		schema: {
			params: gameCodeSchema,
			response: {
				201: createTokenSchema
				//401: ErrorResponseSchema // TODO: throw
			}
		},
		handler: joinGameController
	})

	server.route({
		method: 'POST',
		url: '/api/pong-server/new-game',
		preHandler: jwtAuthMiddleware,
		schema: {
			response: {
				201: gameCodeSchema
				//401: ErrorResponseSchema // TODO: throw
			}
		},
		handler: createNewGameController
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
