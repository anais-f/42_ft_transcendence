import type { FastifyInstance } from 'fastify'
import {
	registerController,
	loginController,
	validateAdminController,
	logoutController,
	verifyPasswordController
} from '../controllers/authController.js'
import { googleLoginController } from '../controllers/oauthController.js'
import {
	RegisterSchema,
	LoginActionSchema,
	LoginGoogleSchema
} from '@ft_transcendence/common'
import { apiKeyMiddleware } from '@ft_transcendence/security'

export async function authRoutes(app: FastifyInstance) {
	app.post(
		'/api/register',
		{
			schema: {
				body: RegisterSchema
			}
		},
		registerController
	)
	app.post(
		'/api/login',
		{
			schema: {
				body: LoginActionSchema
			}
		},
		loginController
	)
	app.post(
		'/api/login-google',
		{
			schema: {
				body: LoginGoogleSchema
			}
		},
		googleLoginController
	)
	app.get('/api/admin/validate', validateAdminController)
	app.post('/api/logout', logoutController)

	// Verify password endpoint (for sensitive operations like enabling 2FA)
	app.post(
		'/api/auth/verify-password',
		{
			preHandler: apiKeyMiddleware
		},
		verifyPasswordController
	)

	// Public config endpoint
	app.get('/api/config', async (_request, reply) => {
		console.log('GET /api/config called')
		return reply.send({
			googleClientId: process.env.GOOGLE_CLIENT_ID || null
		})
	})
}
