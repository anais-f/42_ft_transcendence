import { FastifyInstance } from 'fastify'
import { apiKeyMiddleware } from '@ft_transcendence/security'
import { cleanupUserController } from '../controllers/cleanupController.js'
import { UserIdCoerceSchema } from '@ft_transcendence/common'

export function cleanupRoutes(app: FastifyInstance) {
	app.post(
		'/api/internal/game/cleanup/:user_id',
		{
			schema: {
				params: UserIdCoerceSchema
			},
			preHandler: apiKeyMiddleware
		},
		cleanupUserController
	)
}
