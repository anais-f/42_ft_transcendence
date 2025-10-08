import type { FastifyInstance } from 'fastify'
import { listUsersController, getUserController } from '../controllers/userController.js'

export async function userRoutes(app: FastifyInstance) {
  app.get('/users', listUsersController)
  app.get('/users/:id', getUserController)
}