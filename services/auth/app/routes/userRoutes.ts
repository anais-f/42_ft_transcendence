import type { FastifyInstance } from 'fastify'
import {
	listPublicUsersController,
	getPublicUserController,
	deleteUser,
	patchUserPassword
} from '../controllers/userController.js'
import {
	PublicUserListAuthSchema,
	PublicUserAuthSchema,
	PasswordChangeResponseSchema,
	IdParamSchema,
	PasswordBodySchema
} from '@ft_transcendence/common'

export async function userRoutes(app: FastifyInstance) {
	app.get(
		'/api/users',
		{
			schema: {
				response: {
					200: PublicUserListAuthSchema
				}
			}
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
			}
		},
		getPublicUserController
	)
	app.delete(
		'/api/users/:id',
		{
			schema: {
				params: IdParamSchema
			}
		},
		deleteUser
	)
	app.patch(
		'/api/user/:id/password',
		{
			schema: {
				params: IdParamSchema,
				body: PasswordBodySchema,
				response: {
					200: PasswordChangeResponseSchema
				}
			}
		},
		patchUserPassword
	)
}
