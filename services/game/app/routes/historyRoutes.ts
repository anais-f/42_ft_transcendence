import { FastifyInstance } from 'fastify'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import { getUserMatchHistoryController } from '../controllers/historyControllers.js'
import {
	IdParamSchema,
	MatchHistoryResponseSchema
} from '@ft_transcendence/common'

export function historyRoutes(app: FastifyInstance) {
	app.get(
		'/api/user/matchHistory/:id',
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
}
