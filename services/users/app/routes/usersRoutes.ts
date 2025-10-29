import { FastifyPluginAsync } from 'fastify'
import {
	handleUserCreated,
	getPublicUser,
  getPrivateUser
} from '../controllers/usersControllers.js'
import {
	SuccessResponseSchema,
	ErrorResponseSchema,
	PublicUserAuthSchema,
  UserPrivateProfileSchema,
	UserPublicProfileSchema,
	ERROR_MESSAGES
} from '@ft_transcendence/common'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import {apiKeyMiddleware, jwtAuthMiddleware} from "../jwt.js";

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
      preHandler: apiKeyMiddleware
			// preHandler(request, reply, done) {
			// 	if (request.headers['authorization'] !== process.env.USERS_API_SECRET) {
			// 		reply
			// 			.code(401)
			// 			.send({ success: false, error: ERROR_MESSAGES.UNAUTHORIZED })
			// 		return
			// 	}
			// 	done()
			// }
		},
		handleUserCreated
	)

	// GET /api/users/:id - Get public user profile (JWT required - authenticated users only)
  server.get(
      '/api/users/:id',
      {
        schema: {
          params: z.object({ id: z.coerce.number().int().positive() }),
          response: {
            200: UserPublicProfileSchema,
            400: ErrorResponseSchema,
            401: ErrorResponseSchema,
            404: ErrorResponseSchema,
            500: ErrorResponseSchema
          }
        },
        preHandler: jwtAuthMiddleware
      },
      getPublicUser
  )



	// GET /api/users/me - Get private user profile (JWT protected - own profile only)
	server.get(
		'/api/users/me',
		{
			schema: {
				response: {
					200: UserPrivateProfileSchema,
					401: ErrorResponseSchema,
					404: ErrorResponseSchema,
					500: ErrorResponseSchema
				}
			},
			preHandler: jwtAuthMiddleware
		},
		getPrivateUser
	)
}
