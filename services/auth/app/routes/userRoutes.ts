import type { FastifyInstance } from 'fastify'
import {
	listPublicUsersController,
	getPublicUserController,
  deleteUser
} from '../controllers/userController.js'

export async function userRoutes(app: FastifyInstance) {
	app.get('/users', listPublicUsersController)
	app.get('/users/:id', getPublicUserController)
  app.delete('/users/:id', deleteUser)
}
