import type { FastifyInstance } from 'fastify'
import {
	setup2FASchema,
	verify2FASchema,
	disable2FASchema,
	status2FASchema,
	setup2FAResponseSchema,
	verify2FAResponseSchema,
	disable2FAResponseSchema,
	status2FAResponseSchema,
	HttpErrorSchema
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
		'/api/internal/2fa/setup',
		{
			schema: {
				description:
					'Initializes the 2FA setup for a user. Generates a secret key and returns a QR code URL for the authenticator app.',
				tags: ['2fa'],
				body: setup2FASchema,
				response: {
					200: setup2FAResponseSchema,
					400: HttpErrorSchema.meta({
						description: 'Invalid request body'
					}),
					500: HttpErrorSchema.meta({
						description: 'Internal server error during 2FA setup'
					})
				}
			},
			preHandler: apiKeyMiddleware
		},
		setup2FAController
	)

	app.post(
		'/api/internal/2fa/verify',
		{
			schema: {
				description:
					'Verifies the 2FA code provided by the user. Used both for initial setup confirmation and login verification.',
				tags: ['2fa'],
				body: verify2FASchema,
				response: {
					200: verify2FAResponseSchema,
					400: HttpErrorSchema.meta({
						description: 'Invalid request body or malformed code'
					}),
					404: HttpErrorSchema.meta({
						description: 'User not found or 2FA not set up for this user'
					}),
					500: HttpErrorSchema.meta({
						description: 'Internal server error during verification'
					})
				}
			},
			preHandler: apiKeyMiddleware
		},
		verify2FAController
	)

	app.post(
		'/api/internal/2fa/disable',
		{
			schema: {
				description:
					'Disables 2FA for a user. Removes the secret key and deactivates two-factor authentication.',
				tags: ['2fa'],
				body: disable2FASchema,
				response: {
					200: disable2FAResponseSchema,
					400: HttpErrorSchema.meta({
						description: 'Invalid request body'
					}),
					404: HttpErrorSchema.meta({
						description: 'User not found or 2FA not enabled for this user'
					}),
					500: HttpErrorSchema.meta({
						description: 'Internal server error while disabling 2FA'
					})
				}
			},
			preHandler: apiKeyMiddleware
		},
		disable2FAController
	)

	app.post(
		'/api/internal/2fa/status',
		{
			schema: {
				description:
					'Returns the current 2FA status for a user. Indicates whether 2FA is enabled and configured.',
				tags: ['2fa'],
				body: status2FASchema,
				response: {
					200: status2FAResponseSchema,
					400: HttpErrorSchema.meta({
						description: 'Invalid request body'
					}),
					404: HttpErrorSchema.meta({
						description: 'User not found'
					}),
					500: HttpErrorSchema.meta({
						description: 'Internal server error while fetching status'
					})
				}
			},
			preHandler: apiKeyMiddleware
		},
		status2FAController
	)
}
