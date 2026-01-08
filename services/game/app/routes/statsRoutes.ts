import { FastifyInstance } from 'fastify'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import {
	getUserMatchHistoryController,
	getUserStatsController
} from '../controllers/statsControllers.js'
import {
	IdParamSchema,
	MatchHistoryResponseSchema,
	PlayerStatsSchema,
	HttpErrorSchema
} from '@ft_transcendence/common'

export function statsRoutes(app: FastifyInstance) {
	app.get(
		'/api/user/matchHistory/:id',
		{
			schema: {
				tags: ['info'],
				params: IdParamSchema,
				response: {
					200: MatchHistoryResponseSchema,
					401: HttpErrorSchema.meta({
						description: 'Not authenticated'
					})
				}
			},
			preHandler: jwtAuthMiddleware
		},
		getUserMatchHistoryController
	)
	app.get(
		'/api/user/stats/:id',
		{
			schema: {
				tags: ['info'],
				params: IdParamSchema,
				response: {
					200: PlayerStatsSchema,
					401: HttpErrorSchema.meta({
						description: 'Not authenticated'
					})
				}
			},
			preHandler: jwtAuthMiddleware
		},
		getUserStatsController
	)
}
