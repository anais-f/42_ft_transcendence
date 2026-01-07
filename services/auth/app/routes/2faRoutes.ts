import type { FastifyInstance } from 'fastify'
import {
	enable2faController,
	verify2faSetupController,
	verify2faLoginController,
	disable2faController,
	status2faController,
	internalStatus2faController,
	internalGoogleUserStatusController
} from '../controllers/2faController.js'
import {
	Enable2FAResponseSchema,
	IdParamSchema,
	status2FAResponseSchema,
	twofaCodeSchema,
	Verify2FALoginResponseSchema,
	HttpErrorSchema,
	internalGoogleUserStatusResponseSchema
} from '@ft_transcendence/common'
import { apiKeyMiddleware, jwtAuthMiddleware } from '@ft_transcendence/security'
import { z } from 'zod'

export async function twoFARoutes(app: FastifyInstance) {
	app.post(
		'/api/2fa/setup',
		{
			schema: {
				description:
					'Initializes 2FA setup for the authenticated user. Returns a QR code to scan with an authenticator app.',
				tags: ['2fa'],
				response: {
					200: Enable2FAResponseSchema,
					401: HttpErrorSchema.meta({
						description: 'Not authenticated'
					}),
					500: HttpErrorSchema.meta({
						description: 'Internal server error during 2FA setup'
					})
				}
			},
			preHandler: jwtAuthMiddleware
		},
		enable2faController
	)

	app.post(
		'/api/2fa/verify-setup',
		{
			schema: {
				description:
					'Verifies the 2FA code during initial setup to activate 2FA for the user.',
				tags: ['2fa'],
				body: twofaCodeSchema,
				response: {
					200: z.any().meta({ description: '2FA setup verified successfully' }),
					401: HttpErrorSchema.meta({
						description: 'Invalid 2FA code'
					}),
					410: HttpErrorSchema.meta({
						description: 'Setup expired'
					})
				}
			},
			preHandler: jwtAuthMiddleware
		},
		verify2faSetupController
	)

	app.post(
		'/api/2fa/verify-login',
		{
			schema: {
				description:
					'Verifies 2FA code during login. Returns a full auth token upon success.',
				tags: ['2fa', 'auth'],
				body: twofaCodeSchema,
				response: {
					200: Verify2FALoginResponseSchema,
					401: HttpErrorSchema.meta({
						description: 'Invalid 2FA code or pre-2FA token'
					}),
					404: HttpErrorSchema.meta({
						description: '2FA not set up for this user'
					})
				}
			}
		},
		verify2faLoginController
	)

	app.delete(
		'/api/2fa/disable',
		{
			schema: {
				description: 'Disables 2FA for the authenticated user.',
				tags: ['2fa'],
				response: {
					200: z.any().meta({ description: '2FA disabled successfully' }),
					401: HttpErrorSchema.meta({
						description: 'Not authenticated'
					}),
					404: HttpErrorSchema.meta({
						description: '2FA not enabled for this user'
					})
				}
			},
			preHandler: jwtAuthMiddleware
		},
		disable2faController
	)

	app.get(
		'/api/2fa/status',
		{
			schema: {
				description: 'Returns the 2FA status for the authenticated user.',
				tags: ['2fa'],
				response: {
					200: status2FAResponseSchema,
					401: HttpErrorSchema.meta({
						description: 'Not authenticated'
					})
				}
			},
			preHandler: jwtAuthMiddleware
		},
		status2faController
	)

	app.get(
		'/api/internal/2fa/status/:id',
		{
			schema: {
				description: 'Internal endpoint to get 2FA status for a specific user.',
				tags: ['2fa', 'internal'],
				params: IdParamSchema,
				response: {
					200: status2FAResponseSchema,
					401: HttpErrorSchema.meta({
						description: 'Invalid API key'
					}),
					404: HttpErrorSchema.meta({
						description: 'User not found'
					})
				}
			},
			preHandler: apiKeyMiddleware
		},
		internalStatus2faController
	)

	app.get(
		'/api/internal/google/status/:id',
		{
			schema: {
				description:
					'Internal endpoint to check if a user is a Google OAuth user.',
				tags: ['oauth', 'internal'],
				params: IdParamSchema,
				response: {
					200: internalGoogleUserStatusResponseSchema,
					401: HttpErrorSchema.meta({
						description: 'Invalid API key'
					}),
					404: HttpErrorSchema.meta({
						description: 'User not found'
					})
				}
			},
			preHandler: apiKeyMiddleware
		},
		internalGoogleUserStatusController
	)
}
