import type { FastifyInstance } from 'fastify'
import {
	registerController,
	loginController,
	validateAdminController,
	logoutController,
	getConfigController
} from '../controllers/authController.js'
import { googleLoginController } from '../controllers/oauthController.js'
import {
	RegisterSchema,
	LoginActionSchema,
	LoginGoogleSchema,
	RegisterResponseSchema,
	LoginResponseSchema,
	ValidateAdminResponseSchema,
	LogoutResponseSchema,
	ConfigResponseSchema
} from '@ft_transcendence/common'
import { jwtAuthMiddleware } from '@ft_transcendence/security'

export async function authRoutes(app: FastifyInstance) {
	app.post(
		'/api/register',
		{
			schema: {
				body: RegisterSchema,
				response: {
					201: RegisterResponseSchema
				}
			}
		},
		registerController
	)
	app.post(
		'/api/login',
		{
			schema: {
				body: LoginActionSchema,
				response: {
					200: LoginResponseSchema
				}
			}
		},
		loginController
	)
	app.post(
		'/api/login-google',
		{
			schema: {
				body: LoginGoogleSchema,
				response: {
					200: LoginResponseSchema
				}
			}
		},
		googleLoginController
	)
	app.get(
		'/api/admin/validate',
		{
			schema: {
				response: {
					200: ValidateAdminResponseSchema
				}
			}
		},
		validateAdminController
	)
	app.post(
		'/api/logout',
		{
			schema: {
				response: {
					200: LogoutResponseSchema
				}
			}
		},
		logoutController
	)
	app.get(
		'/api/config',
		{
			schema: {
				response: {
					200: ConfigResponseSchema
				}
			}
		},
		getConfigController
	)
	app.get('/api/admin/validate', validateAdminController)

	app.post('/api/logout', { preHandler: jwtAuthMiddleware }, logoutController)

	// Public config endpoint
	app.get('/api/config', async (_request, reply) => {
		console.log('GET /api/config called')
		return reply.send({
			googleClientId: process.env.GOOGLE_CLIENT_ID || null
		})
	})
}
