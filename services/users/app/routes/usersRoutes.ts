import { FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import {
	handleUserCreated,
	getPublicUser,
	getPrivateUser
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
	UpdateUserStatusSchema
} from '@ft_transcendence/common'
import { z } from 'zod'
import { jwtAuthMiddleware, apiKeyMiddleware } from '@ft_transcendence/security'

export const usersRoutes: FastifyPluginAsync = async (fastify) => {
	const server = fastify.withTypeProvider<ZodTypeProvider>()

	// POST /api/internal/users/new-user - Create new user (API Key required)
	await server.route({
		method: 'POST',
		url: '/api/internal/users/new-user',
		preHandler: [apiKeyMiddleware],
		handler: handleUserCreated,
		schema: {
			body: PublicUserAuthSchema,
			response: {
				200: SuccessResponseSchema,
				201: SuccessResponseSchema,
				401: ErrorResponseSchema,
				400: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		}
	})

	// GET /api/users/:id - Get public user profile (JWT required - authenticated users only)
	await server.route({
		method: 'GET',
		url: '/api/users/:id',
		preHandler: [jwtAuthMiddleware],
		handler: getPublicUser,
		schema: {
			params: z.object({ id: z.coerce.number().int().positive() }),
			response: {
				200: UserPublicProfileSchema,
				400: ErrorResponseSchema,
				401: ErrorResponseSchema,
				404: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		}
	})

	// GET /api/users/me - Get private user profile (JWT protected - own profile only)
	await server.route({
		method: 'GET',
		url: '/api/users/me',
		preHandler: [jwtAuthMiddleware],
		handler: getPrivateUser,
		schema: {
			response: {
				200: UserPrivateProfileSchema,
				401: ErrorResponseSchema,
				404: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		}
	})

	// PATCH /api/users/me - Update private user profile (JWT protected - own profile only)
	await server.route({
		method: 'PATCH',
		url: '/api/users/me',
		preHandler: [jwtAuthMiddleware],
		handler: updateUsername,
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
		}
	})

	// PATCH /api/users/me/avatar - Update avatar (JWT protected)
	await server.route({
		method: 'PATCH',
		url: '/api/users/me/avatar',
		preHandler: [jwtAuthMiddleware],
		handler: updateAvatar,
		schema: {
			consumes: ['multipart/form-data', 'image/jpeg', 'image/png'],
			response: {
				200: SuccessResponseSchema,
				400: ErrorResponseSchema,
				401: ErrorResponseSchema,
				404: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		}
	})

	// PATCH /api/internal/users/:id/status - Update user status (API Key protected)
	await server.route({
		method: 'PATCH',
		url: '/api/internal/users/:id/status',
		preHandler: [apiKeyMiddleware],
		handler: updateUserStatus,
		schema: {
			params: z.object({ id: z.coerce.number().int().positive() }),
			body: UpdateUserStatusSchema,
			response: {
				200: SuccessResponseSchema,
				400: ErrorResponseSchema,
				401: ErrorResponseSchema,
				404: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		}
	})
}
