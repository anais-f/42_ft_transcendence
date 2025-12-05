import { FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import {
	handleUserCreated,
	getPublicUser,
	getPrivateUser,
	searchUserByUsernameController
} from '../controllers/usersControllers.js'
import {
	updateUsername,
	updateAvatar,
	updateUserStatus
} from '../controllers/updateUsersControllers.js'
import {
	SuccessResponseSchema,
	ErrorResponseSchema,
	PublicUserAuthSchema,
	UserPrivateProfileSchema,
	UserPublicProfileSchema,
	UserProfileUpdateUsernameSchema,
	UpdateUserStatusSchema,
	UserIdCoerceSchema,
	UserSearchResultSchema
} from '@ft_transcendence/common'
import { jwtAuthMiddleware, apiKeyMiddleware } from '@ft_transcendence/security'

export const usersRoutes: FastifyPluginAsync = async (fastify) => {
	const server = fastify.withTypeProvider<ZodTypeProvider>()

	// POST /api/internal/users/new-user - Create new user (API Key required)
	server.route({
		method: 'POST',
		url: '/api/internal/users/new-user',
		preHandler: [apiKeyMiddleware],
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
		handler: handleUserCreated
	})

	// GET /api/users/profile/:user_id - Get public user profile (JWT required - authenticated users only)
	server.route({
		method: 'GET',
		url: '/api/users/profile/:user_id(\\d+)',
		preHandler: [jwtAuthMiddleware],
		schema: {
			params: UserIdCoerceSchema,
			response: {
				200: UserPublicProfileSchema,
				400: ErrorResponseSchema,
				401: ErrorResponseSchema,
				404: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		},
		handler: getPublicUser
	})

	// INTERNAL: GET /api/internal/users/profile/:user_id - Get public user profile for internal service-to-service calls (API Key required)
	server.route({
		method: 'GET',
		url: '/api/internal/users/profile/:user_id(\\d+)',
		preHandler: [apiKeyMiddleware],
		schema: {
			params: UserIdCoerceSchema,
			response: {
				200: UserPublicProfileSchema,
				400: ErrorResponseSchema,
				401: ErrorResponseSchema,
				404: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		},
		handler: getPublicUser
	})

	// GET /api/users/me - Get private user profile (JWT protected - own profile only)
	server.route({
		method: 'GET',
		url: '/api/users/me',
		preHandler: [jwtAuthMiddleware],
		schema: {
			response: {
				200: UserPrivateProfileSchema,
				401: ErrorResponseSchema,
				404: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		},
		handler: getPrivateUser
	})

	// PATCH /api/users/me - Update private user profile (JWT protected - own profile only)
	server.route({
		method: 'PATCH',
		url: '/api/users/me',
		preHandler: [jwtAuthMiddleware],
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
		handler: updateUsername
	})

	// PATCH /api/users/me/avatar - Update avatar (JWT protected)
	server.route({
		method: 'PATCH',
		url: '/api/users/me/avatar',
		preHandler: [jwtAuthMiddleware],
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
		handler: updateAvatar
	})

	// PATCH /api/internal/users/:id/status - Update user status (API Key protected)
	server.route({
		method: 'PATCH',
		url: '/api/internal/users/:user_id/status',
		preHandler: [apiKeyMiddleware],
		schema: {
			params: UserIdCoerceSchema,
			body: UpdateUserStatusSchema,
			response: {
				200: SuccessResponseSchema,
				400: ErrorResponseSchema,
				401: ErrorResponseSchema,
				404: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		},
		handler: updateUserStatus
	})

	// GET /api/users/search-by-username - Search user by exact username
	server.route({
		method: 'GET',
		url: '/api/users/search-by-username',
		preHandler: [jwtAuthMiddleware],
		schema: {
			querystring: z.object({
				username: z.string().min(4).max(32)
			}),
			response: {
				200: UserSearchResultSchema,
				400: ErrorResponseSchema,
				401: ErrorResponseSchema,
				404: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		},
		handler: searchUserByUsernameController
	})
}
