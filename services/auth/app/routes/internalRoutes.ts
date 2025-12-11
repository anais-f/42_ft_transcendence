import { FastifyInstance } from 'fastify'
import { apiKeyMiddleware } from '@ft_transcendence/security'
import { ValidateSessionSchema } from '@ft_transcendence/common'
import { validateSessionController } from '../controllers/internalController.js'

export async function internalRoutes(app: FastifyInstance) {
	app.post(
'/api/internal/validate-session',
{
schema: {
body: ValidateSessionSchema
},
preHandler: apiKeyMiddleware
},
validateSessionController
)
}
