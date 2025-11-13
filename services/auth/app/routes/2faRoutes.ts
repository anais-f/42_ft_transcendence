import type { FastifyInstance } from 'fastify'
import {
	enable2faController,
	verify2faController,
	verify2faSetupController,
	verify2faLoginController,
	disable2faController,
	status2faController
} from '../controllers/2faController.js'
import { twofaCodeSchema } from '@ft_transcendence/common'

export async function twoFARoutes(app: FastifyInstance) {
	app.post('/api/2fa/setup', enable2faController)
	app.post(
		'/api/2fa/verify-setup',
		{ schema: { body: twofaCodeSchema } },
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
		verify2faController
	)
	app.delete('/api/2fa/disable', disable2faController)
	app.get('/api/2fa/status', status2faController)
}
