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
	fastify.post(
		'/api/users/new-user',
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

	fastify.get(
		'/api/users/:id',
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

	// TODO: GET /users/me - Private profile of the authenticated user
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
