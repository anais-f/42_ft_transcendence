import type { FastifyInstance } from 'fastify'
import {
	enable2faController,
	verify2faController,
	disable2faController
} from '../controllers/2faController.js'
import { twofaCodeSchema } from '@ft_transcendence/common'

export async function twoFARoutes(app: FastifyInstance) {
	app.post('/api/2fa/setup', enable2faController)
	app.post(
		'/api/2fa/verify',
		{
			schema: { body: twofaCodeSchema }
		},
		verify2faController
	)
	app.delete('/api/2fa/disable', disable2faController)
}
