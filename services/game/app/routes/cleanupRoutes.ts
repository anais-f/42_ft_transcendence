import { FastifyInstance } from 'fastify'
import { apiKeyMiddleware } from '@ft_transcendence/security'
import { cleanupUserController } from '../controllers/cleanupController.js'
import {UserIdSchema} from "@ft_transcendence/common";

export function cleanupRoutes(app: FastifyInstance) {
	app.post(
		'/api/game/internal/cleanup/:userId',
		{
			schema: {
				params: UserIdSchema
			},
			preHandler: apiKeyMiddleware
		},
		cleanupUserController
	)
}
