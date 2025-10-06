import type { FastifyInstance } from 'fastify'
import { registerController, loginController } from '../controllers/authController.js'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', registerController)
  app.post('/login', loginController)
}