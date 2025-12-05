import { FastifyInstance } from 'fastify'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import { getMatchHistoryController, getUserMatchHistoryController } from '../controllers/historyControllers.js'

export function historyRoutes(app: FastifyInstance) {
	app.get(
		'/api/matchHistory/:id',
		{ preHandler: jwtAuthMiddleware },
		getMatchHistoryController
	)
	app.get(
		'/api/user/matchHistory/:id',{ preHandler: jwtAuthMiddleware },
		getUserMatchHistoryController
	)
}
