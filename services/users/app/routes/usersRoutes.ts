import { FastifyPluginAsync } from 'fastify'
import {
	handleUserCreated,
	getPublicUser
} from '../controllers/usersControllers.js'
import {
	SuccessResponseSchema,
	ErrorResponseSchema,
	PublicUserAuthSchema,
	UserPublicProfileSchema
} from '@ft_transcendence/common'

export const usersRoutes: FastifyPluginAsync = async (fastify) => {
	// POST /users/webhookNewUser - Webhook pour créer un nouvel utilisateur quand je recois la notif de auth
	fastify.post(
		'/users/new-user',
		{
			schema: {
				body: PublicUserAuthSchema,
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

	// TODO : GET /users/:id - Récupérer le profil public d'un utilisateur par son ID
	fastify.get(
		'/users/:id',
		{
			schema: {
				response: {
					200: UserPublicProfileSchema,
					404: ErrorResponseSchema,
					500: ErrorResponseSchema
				}
			}
		},
		getPublicUser
	)

	// TODO: GET /users/me - Récupérer le profil privé de l'utilisateur authentifié
	// fastify.get('/users/me', {
	//       schema: {
	//         response: {
	//           200: UserPrivateProfileSchema,
	//           404: ErrorResponseSchema,
	//           500: ErrorResponseSchema
	//         }
	//       }
	//     },
	//     getPrivateUser
	// )
}
