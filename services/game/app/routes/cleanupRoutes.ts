import { FastifyInstance } from 'fastify'
import { apiKeyMiddleware } from '@ft_transcendence/security'
import { cleanupUserController } from '../controllers/cleanupController.js'
import { UserIdCoerceSchema } from '@ft_transcendence/common'

export function cleanupRoutes(app: FastifyInstance) {
	app.post(
		'/api/game/internal/cleanup/:user_id',
		{
			schema: {
				tags: ['game', 'tournament'],
				params: UserIdCoerceSchema
			},
			preHandler: apiKeyMiddleware
		},
		cleanupUserController
	)
}
