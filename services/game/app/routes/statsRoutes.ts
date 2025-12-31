import { FastifyInstance } from 'fastify'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import {
	getUserMatchHistoryController,
	getUserStatsController
} from '../controllers/statsControllers.js'
import {
	IdParamSchema,
	MatchHistoryResponseSchema,
	PlayerStatsSchema
} from '@ft_transcendence/common'

export function statsRoutes(app: FastifyInstance) {
	app.get(
		'/api/game/matchHistory/:id',
		{
			schema: {
				params: IdParamSchema,
				response: {
					200: MatchHistoryResponseSchema
				}
			},
			preHandler: jwtAuthMiddleware
		},
		getUserMatchHistoryController
	)
	app.get(
		'/api/game/stats/:id',
		{
			schema: {
				params: IdParamSchema,
				response: {
					200: PlayerStatsSchema
				}
			},
			preHandler: jwtAuthMiddleware
		},
		getUserStatsController
	)
}
