import type { FastifyInstance } from 'fastify'
import {
	listPublicUsersController,
	getPublicUserController,
	patchUserPassword,
	verifyMyPasswordController
} from '../controllers/userController.js'
import { apiKeyMiddleware, jwtAuthMiddleware } from '@ft_transcendence/security'
import {
	ChangeMyPasswordSchema,
	PublicUserListAuthSchema,
	PublicUserAuthSchema,
	IdParamSchema,
	PasswordBodySchema,
	HttpErrorSchema
} from '@ft_transcendence/common'

export async function userRoutes(app: FastifyInstance) {
	app.patch(
		'/api/user/me/password',
		{
			schema: {
				description: 'Changes the password for the authenticated user.',
				tags: ['user'],
				body: ChangeMyPasswordSchema,
				response: {
					200: { type: 'object' },
					400: HttpErrorSchema.meta({
						description: 'Invalid request body'
					}),
					401: HttpErrorSchema.meta({
						description: 'Not authenticated or wrong current password'
					})
				}
			},
			preHandler: jwtAuthMiddleware
		},
		patchUserPassword
	)

	app.post(
		'/api/verify-my-password',
		{
			schema: {
				description:
					"Verifies if the provided password matches the authenticated user's password.",
				tags: ['user', 'auth'],
				body: PasswordBodySchema,
				response: {
					200: { type: 'object' },
					401: HttpErrorSchema.meta({
						description: 'Not authenticated or wrong password'
					})
				}
			},
			preHandler: jwtAuthMiddleware
		},
		verifyMyPasswordController
	)

	app.get(
		'/api/internal/users',
		{
			schema: {
				description: 'Internal endpoint to list all users with auth info.',
				tags: ['user', 'internal'],
				response: {
					200: PublicUserListAuthSchema,
					401: HttpErrorSchema.meta({
						description: 'Invalid API key'
					})
				}
			},
			preHandler: apiKeyMiddleware
		},
		listPublicUsersController
	)

	app.get(
		'/api/users/:id',
		{
			schema: {
				description: 'Returns public user information by ID.',
				tags: ['user'],
				params: IdParamSchema,
				response: {
					200: PublicUserAuthSchema,
					401: HttpErrorSchema.meta({
						description: 'Not authenticated'
					}),
					404: HttpErrorSchema.meta({
						description: 'User not found'
					})
				}
			},
			preHandler: jwtAuthMiddleware
		},
		getPublicUserController
	)
}
