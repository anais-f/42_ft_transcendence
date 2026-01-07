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
	ConfigResponseSchema,
	HttpErrorSchema
} from '@ft_transcendence/common'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import { z } from 'zod'

export async function authRoutes(app: FastifyInstance) {
	app.post(
		'/api/register',
		{
			schema: {
				description:
					'Registers a new user account with login and password credentials.',
				tags: ['auth'],
				body: RegisterSchema,
				response: {
					201: RegisterResponseSchema,
					400: HttpErrorSchema.meta({
						description: 'Invalid request body or validation error'
					}),
					409: HttpErrorSchema.meta({
						description: 'Login already exists'
					})
				}
			}
		},
		registerController
	)

	app.post(
		'/api/login',
		{
			schema: {
				description:
					'Authenticates a user with login and password. Returns a JWT token or ask for 2FA verification.',
				tags: ['auth'],
				body: LoginActionSchema,
				response: {
					200: LoginResponseSchema,
					401: HttpErrorSchema.meta({
						description: 'Invalid credentials'
					}),
					404: HttpErrorSchema.meta({
						description: 'User not found'
					})
				}
			}
		},
		loginController
	)

	app.post(
		'/api/login-google',
		{
			schema: {
				description:
					'Authenticates a user with Google OAuth and creates their account if necessary.',
				tags: ['auth', 'oauth'],
				body: LoginGoogleSchema,
				response: {
					200: LoginResponseSchema,
					400: HttpErrorSchema.meta({
						description: 'Invalid Google token'
					}),
					500: HttpErrorSchema.meta({
						description: 'Internal server error during OAuth'
					})
				}
			}
		},
		googleLoginController
	)

	app.get(
		'/api/admin/validate',
		{
			schema: {
				description: 'Validates if the current user has admin privileges.',
				tags: ['auth', 'admin'],
				response: {
					200: z.any().meta({ description: 'User is an admin' }),
					401: HttpErrorSchema.meta({
						description: 'Not authenticated'
					}),
					403: HttpErrorSchema.meta({
						description: 'Not an admin'
					})
				}
			},
			preHandler: jwtAuthMiddleware
		},
		validateAdminController
	)

	app.post(
		'/api/logout',
		{
			schema: {
				description: 'Logs out the current user and invalidates the session.',
				tags: ['auth'],
				response: {
					200: z.any().meta({ description: 'Logout successful' })
				}
			},
			preHandler: jwtAuthMiddleware
		},
		logoutController
	)

	app.get(
		'/api/config',
		{
			schema: {
				description:
					'Returns the public configuration (e.g., Google OAuth availability).',
				tags: ['auth', 'config'],
				response: {
					200: ConfigResponseSchema
				}
			}
		},
		getConfigController
	)
}
