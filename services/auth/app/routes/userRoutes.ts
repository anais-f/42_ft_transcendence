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
	PasswordBodySchema
} from '@ft_transcendence/common'

// TODO : Add authentication/authorization middleware where necessary and delete user only by himself or admin
export async function userRoutes(app: FastifyInstance) {
	app.patch(
		'/api/user/me/password',
		{
			schema: {
				body: ChangeMyPasswordSchema
			},
			preHandler: jwtAuthMiddleware
		},
		patchUserPassword
	)

	app.post(
		'/api/verify-my-password',
		{
			schema: {
				body: PasswordBodySchema
			},
			preHandler: jwtAuthMiddleware
		},
		verifyMyPasswordController
	)
	app.get(
		'/api/internal/users',
		{
			schema: {
				response: {
					200: PublicUserListAuthSchema
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
				params: IdParamSchema,
				response: {
					200: PublicUserAuthSchema
				}
			},
			preHandler: jwtAuthMiddleware
		},
		getPublicUserController
	)
}
