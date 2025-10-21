import type { FastifyInstance } from 'fastify'
import {
	registerController,
	loginController
} from '../controllers/authController.js'
import { RegisterSchema, LoginActionSchema } from '@ft_transcendence/common'

export async function authRoutes(app: FastifyInstance) {
	app.post('/api/register', {
    schema: {
      body: RegisterSchema
      }
    }, registerController)
	app.post('/api/login', {
    schema: {
      body: LoginActionSchema
      }
    }, loginController)
}

