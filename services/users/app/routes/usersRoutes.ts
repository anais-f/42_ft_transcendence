import { FastifyPluginAsync } from 'fastify'
import { handleUserCreated, getUser } from '../controllers/usersControllers.js'
import {
	SuccessResponseSchema,
	ErrorResponseSchema,
	PublicUserSchema,
	UserProfileSchema
} from '@ft_transcendence/common'

export const usersRoutes: FastifyPluginAsync = async (fastify) => {
	// POST /users/webhookNewUser - Webhook pour créer un nouvel utilisateur quand je recois la notif de auth
	fastify.post(
		'/users/webhookNewUser',
		{
			schema: {
				body: PublicUserSchema,
				response: {
					200: SuccessResponseSchema,
					201: SuccessResponseSchema,
					400: ErrorResponseSchema,
					500: ErrorResponseSchema
				}
			}
		},
		handleUserCreated
	)

	fastify.get(
		'/users/:id',
		{
			schema: {
				response: {
					200: UserProfileSchema,
					404: ErrorResponseSchema,
					500: ErrorResponseSchema
				}
			}
		},
		getUser
	)
}
