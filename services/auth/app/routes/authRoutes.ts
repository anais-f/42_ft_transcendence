import type { FastifyInstance } from 'fastify'
import {
	registerController,
	loginController,
	registerGoogleController

} from '../controllers/authController.js'
import { RegisterSchema, LoginActionSchema, RegisterGoogleSchema } from '@ft_transcendence/common'

export async function authRoutes(app: FastifyInstance) {
	app.post(
		'/api/register',
		{
			schema: {
				body: RegisterSchema
			}
		},
		registerController
	)
	app.post(
		'/api/login',
		{
			schema: {
				body: LoginActionSchema
			}
		},
		loginController
	)
	app.post(
		'/api/register-google',
		{
			schema: {
				body: RegisterGoogleSchema
			}
		},
		registerGoogleController
	)
}
