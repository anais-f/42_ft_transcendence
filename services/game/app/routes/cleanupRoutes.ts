import { FastifyInstance } from 'fastify'
import { apiKeyMiddleware } from '@ft_transcendence/security'
import { cleanupUserController } from '../controllers/cleanupController.js'
import { UserIdCoerceSchema } from '@ft_transcendence/common'
import { z } from 'zod'
import { HttpErrorSchema } from '@ft_transcendence/common'

export function cleanupRoutes(app: FastifyInstance) {
	app.post(
		'/api/internal/game/cleanup/:user_id',
		{
			schema: {
				description:
					'Cleans up all game-related data for the specified user. Used when a user is deleted.',
				tags: ['game', 'tournament'],
				response: {
					200: z
						.any()
						.meta({ description: 'User cleanup completed successfully' }),
					400: HttpErrorSchema.meta({
						description: 'User_id is required'
					}),
					404: HttpErrorSchema.meta({
						description: 'User is not in any tournament/Tournament not found/'
					}),
					409: HttpErrorSchema.meta({
						description: "You can't quit a tournament that has already started"
					})
				},
				params: UserIdCoerceSchema
			},
			preHandler: apiKeyMiddleware
		},
		cleanupUserController
	)
}
