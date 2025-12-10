import { FastifyInstance } from 'fastify'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import { getUserMatchHistoryController } from '../controllers/historyControllers.js'

export function historyRoutes(app: FastifyInstance) {
	app.get(
		'/api/user/matchHistory/:id',
		{ preHandler: jwtAuthMiddleware },
		getUserMatchHistoryController
	)
}
