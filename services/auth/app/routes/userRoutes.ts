import type { FastifyInstance } from 'fastify'
import {
	listPublicUsersController,
	getPublicUserController,
	deleteUser,
	patchUserPassword
} from '../controllers/userController.js'

// TODO : Add authentication/authorization middleware where necessary
export async function userRoutes(app: FastifyInstance) {
	app.get('/api/users', listPublicUsersController)
	app.get('/api/users/:id', getPublicUserController)
	app.delete('/api/users/:id', deleteUser)
	app.patch('/api/user/me/password', patchUserPassword)
}
