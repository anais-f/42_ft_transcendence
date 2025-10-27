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

const API_AUTH_USERS = process.env.API_AUTH_SECRET || 'test'

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
					401: ErrorResponseSchema,
					400: ErrorResponseSchema,
					500: ErrorResponseSchema
				}
			},
			preHandler(request, reply, done) {
				if (request.headers['authorization'] !== API_AUTH_USERS) {
					void reply.code(401).send({ error: 'Unauthorized' })
					return
				}
				done()
			}
		},
		handleUserCreated
	)

	//TODO: protect routes with JWT
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
					401: ErrorResponseSchema,
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
