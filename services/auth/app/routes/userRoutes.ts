import type { FastifyInstance } from 'fastify'
import {
	listPublicUsersController,
	getPublicUserController,
	deleteUser,
	patchUserPassword,
	verifyMyPasswordController
} from '../controllers/userController.js'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import {
	ChangeMyPasswordSchema,
	PasswordBodySchema
} from '@ft_transcendence/common'

// TODO : Add authentication/authorization middleware where necessary and delete user only by himself or admin
export async function userRoutes(app: FastifyInstance) {
	app.get('/api/users', listPublicUsersController)
	app.get('/api/users/:id', getPublicUserController)
	app.delete('/api/users/:id', deleteUser) // TODO : delete this route or protect it !
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
}
