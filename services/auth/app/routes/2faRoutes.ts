import type { FastifyInstance } from 'fastify'
import {
	enable2faController,
	verify2faSetupController,
	verify2faLoginController,
	disable2faController,
	status2faController
} from '../controllers/2faController.js'
import { twofaCodeSchema } from '@ft_transcendence/common'
import { jwtAuthMiddleware } from '@ft_transcendence/security'

export async function twoFARoutes(app: FastifyInstance) {
	// Setup 2FA - requires auth_token (user already authenticated)
	app.post(
		'/api/2fa/setup',
		{ preHandler: jwtAuthMiddleware },
		enable2faController
	)
	
	// Verify during setup - requires auth_token
	app.post(
		'/api/2fa/verify-setup',
		{
			schema: { body: twofaCodeSchema },
			preHandler: jwtAuthMiddleware
		},
		verify2faSetupController
	)
	app.post(
		'/api/2fa/verify-login',
		{ schema: { body: twofaCodeSchema } },
		verify2faLoginController
	)
	app.post(
		'/api/2fa/verify',
		{
			schema: { body: twofaCodeSchema }
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
		{ preHandler: jwtAuthMiddleware },
		status2faController
	)
}
