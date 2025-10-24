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
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'


export const usersRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<ZodTypeProvider>()

	server.post(
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

	server.get(
		'/api/users/:id',
		{
			schema: {
        params: z.object({
          id: z.coerce.number().int().positive()
        }),
				response: {
					200: UserPublicProfileSchema,
          400: ErrorResponseSchema,
					404: ErrorResponseSchema,
					500: ErrorResponseSchema
				}
			}
		},
		getPublicUser
	)

	// TODO: GET /users/me - Private profile of the authenticated user
	// server.get('/users/me', {
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
