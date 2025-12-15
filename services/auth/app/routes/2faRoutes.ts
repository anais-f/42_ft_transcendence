import type { FastifyInstance } from 'fastify'
import {
	enable2faController,
	verify2faSetupController,
	verify2faLoginController,
	disable2faController,
	status2faController
} from '../controllers/2faController.js'
import { Enable2FAResponseSchema, status2FAResponseSchema, twofaCodeSchema } from '@ft_transcendence/common'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import { Schema } from 'zod'

export async function twoFARoutes(app: FastifyInstance) {
	app.post(
		'/api/2fa/setup',
		{
			schema: {
				response: {
					200: Enable2FAResponseSchema
				}
			},
			preHandler: jwtAuthMiddleware
		},
		enable2faController
	)
	app.post(
		'/api/2fa/verify-setup',
		{
			schema: { body: twofaCodeSchema},
			preHandler: jwtAuthMiddleware
		},
		verify2faSetupController
	)
	app.post(
		'/api/2fa/verify-login',
		{ 
			schema: { 
				body: twofaCodeSchema,
				response: { 
					200: Enable2FAResponseSchema
				}
			} 
		},
		verify2faLoginController
	)
	app.delete(
		'/api/2fa/disable',
		{ preHandler: jwtAuthMiddleware },
		disable2faController
	)
	app.get(
		'/api/2fa/status',
		{ 
			schema: {
				response: {
					200: status2FAResponseSchema
				}
			},
			preHandler: jwtAuthMiddleware
		},
		status2faController
	)
}
