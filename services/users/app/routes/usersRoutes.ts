import { FastifyPluginAsync } from 'fastify'
import {
	handleUserCreated,
	getPublicUser,
	getPrivateUser
} from '../controllers/usersControllers.js'
import {
  updateUsername,
  updateAvatar
} from '../controllers/updateUsersControllers.js'
import {
	SuccessResponseSchema,
	ErrorResponseSchema,
	PublicUserAuthSchema,
	UserPrivateProfileSchema,
	UserPublicProfileSchema,
	UserProfileUpdateUsernameSchema
} from '@ft_transcendence/common'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { jwtAuthMiddleware, apiKeyMiddleware } from '@ft_transcendence/security'

export const usersRoutes: FastifyPluginAsync = async (fastify) => {
	const server = fastify.withTypeProvider<ZodTypeProvider>()

	// POST /api/users/new-user - Create new user (API Key required)
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

	// PATCH /api/users/me - Update private user profile (JWT protected - own profile only)
	server.patch(
		'/api/users/me',
		{
			schema: {
				body: UserProfileUpdateUsernameSchema,
				response: {
					200: SuccessResponseSchema,
					400: ErrorResponseSchema,
					401: ErrorResponseSchema,
					404: ErrorResponseSchema,
					409: ErrorResponseSchema,
					500: ErrorResponseSchema
				}
			},
			preHandler: jwtAuthMiddleware
		},
		updateUsername
	)

	// PATCH /api/users/me/avatar - Update avatar (JWT protected)
	server.patch(
		'/api/users/me/avatar',
		{
			schema: {
				consumes: ['multipart/form-data', 'image/jpeg', 'image/png'],
				response: {
					200: SuccessResponseSchema,
					400: ErrorResponseSchema,
					401: ErrorResponseSchema,
					404: ErrorResponseSchema,
					500: ErrorResponseSchema
				}
			},
			preHandler: jwtAuthMiddleware
		},
		updateAvatar
	)
}
