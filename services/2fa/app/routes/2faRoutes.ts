import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import {
	setup2FASchema,
	verify2FASchema,
	disable2FASchema,
	status2FASchema,
	setup2FAResponseSchema,
	verify2FAResponseSchema,
	disable2FAResponseSchema,
	status2FAResponseSchema
} from '@ft_transcendence/common'
import {
	setup2FAController,
	verify2FAController,
	disable2FAController,
	status2FAController
} from '../controllers/2facontrollers.js'
import { apiKeyMiddleware } from '@ft_transcendence/security'

export async function registerRoutes(app: FastifyInstance) {
	app.post(
		'/api/2fa/setup',
		{
			schema: {
				body: setup2FASchema,
				response: {
					200: setup2FAResponseSchema
				}
			},
			preHandler: apiKeyMiddleware
		},
		setup2FAController
	)
	app.post(
		'/api/2fa/verify',
		{
			schema: {
				body: verify2FASchema,
				response: {
					200: verify2FAResponseSchema
				}
			},
			preHandler: apiKeyMiddleware
		},
		verify2FAController
	)
	app.post(
		'/api/2fa/disable',
		{
			schema: {
				body: disable2FASchema,
				response: {
					200: disable2FAResponseSchema
				}
			},
			preHandler: apiKeyMiddleware
		},
		disable2FAController
	)
	app.post(
		'/api/2fa/status',
		{
			schema: {
				body: status2FASchema,
				response: {
					200: status2FAResponseSchema
				}
			},
			preHandler: apiKeyMiddleware
		},
		status2FAController
	)
}
