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
import z from 'zod'

export const gameRoutes: FastifyPluginAsync = async (fastify) => {
	const server = fastify.withTypeProvider<ZodTypeProvider>()

	server.route({
		method: 'POST',
		url: '/api/game/join-game/:code',
		preHandler: jwtAuthMiddleware,
		schema: {
			description:
				'This endpoint allows a player to join an existing game using the game code. The received JWT serves to authenticate the player for subsequent interactions within the game.',
			params: CodeParamSchema,
			response: {
				201: createTokenSchema,
				404: z.object().meta({ description: 'unknow game code' }),
				409: z
					.union([
						z.object({}).meta({ description: 'player already in a game' }),
						z
							.object({})
							.meta({ description: 'player not allowed in this game' })
					])
					.meta({ description: 'conflict error' })
			}
		},
		handler: joinGameController
	})

	server.route({
		method: 'POST',
		url: '/api/game/new-game',
		preHandler: jwtAuthMiddleware,
		schema: {
			description:
				'This endpoint creates a new game and assigns Player 1 to the requester. Note that the requester still needs to join the game using the code returned.',
			body: CreateGameSchema,
			response: {
				201: CodeParamSchema,
				404: z.object().meta({ description: 'unknow game code' }),
				409: z.object().meta({ description: 'player already in a game' })
			}
		},
		handler: createNewGameController
	})

	server.route({
		method: 'GET',
		url: '/api/game/assigned',
		preHandler: jwtAuthMiddleware,
		schema: {
			description:
				'This endpoint returns the game code for a game the player is already assigned to.',
			response: {
				200: CodeParamSchema,
				404: z.any().meta({ description: 'no game assigned to the player.' })
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
