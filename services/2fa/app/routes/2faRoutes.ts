import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import {
	setup2FAResponseSchema,
	verify2FAResponseSchema,
	disable2FAResponseSchema,
	status2FAResponseSchema
} from '@ft_transcendence/common'
import { setup2FAController,
		verify2FAController,
		disable2FAController,
		status2FAController
 } from '../controllers/2facontrollers.js'

export async function registerRoutes(app: FastifyInstance) {
	app.post(
		'/api/2fa/setup',
		{
			schema: {
				body: setup2FAResponseSchema
			}
		},
		setup2FAController
		)
	app.post(
		'/api/2fa/verify',
		{
			schema: {
				body: verify2FAResponseSchema
			}
		},
		verify2FAController
		)
	app.post(
		'/api/2fa/disable',
		{
			schema: {
				body: disable2FAResponseSchema
			}
		},
		disable2FAController
		)
	app.post(
		'/api/2fa/status',
		{
			schema: {
				body: status2FAResponseSchema
			}
		},
		status2FAController
		)
}
