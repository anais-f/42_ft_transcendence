import type { FastifyInstance } from 'fastify'
import {
	listPublicUsersController,
	getPublicUserController,
	deleteUser,
	patchUserPassword
} from '../controllers/userController.js'

export async function userRoutes(app: FastifyInstance) {
	app.get('/api/users', listPublicUsersController)
	app.get('/api/users/:id', getPublicUserController)
	app.delete('/api/users/:id', deleteUser)
	app.patch('/api/user/:id/password', patchUserPassword)
}
