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

	server.route({
		method: 'POST',
		url: '/api/internal/users/new-user',
		preHandler: [apiKeyMiddleware],
		schema: {
			description:
				'Internal endpoint for auth service to create a new user in the users database. Called when a user registers.',
			tags: ['Internal'],
			body: PublicUserAuthSchema,
			response: {
				201: z.object({ message: z.string() }),
				401: z.object().meta({ description: 'Invalid API key' })
			}
		},
		handler: handleUserCreated
	})

	server.route({
		method: 'GET',
		url: '/api/users/profile/:user_id(\\d+)',
		preHandler: [jwtAuthMiddleware],
		schema: {
			description: 'Get public profile information for any user by their ID.',
			tags: ['Users'],
			params: UserIdCoerceSchema,
			response: {
				200: UserPublicProfileSchema,
				400: z.object().meta({ description: 'Invalid user ID' }),
				401: z.object().meta({ description: 'Authentication required' }),
				404: z.object().meta({ description: 'User not found' })
			}
		},
		handler: getPublicUser
	})

	server.route({
		method: 'GET',
		url: '/api/internal/users/profile/:user_id(\\d+)',
		preHandler: [apiKeyMiddleware],
		schema: {
			description:
				'Internal endpoint for services to fetch user profile data.',
			tags: ['Internal'],
			params: UserIdCoerceSchema,
			response: {
				200: UserPublicProfileSchema,
				400: z.object().meta({ description: 'Invalid user ID' }),
				401: z.object().meta({ description: 'Invalid API key' }),
				404: z.object().meta({ description: 'User not found' })
			}
		},
		handler: getPublicUser
	})

	server.route({
		method: 'GET',
		url: '/api/users/me',
		preHandler: [jwtAuthMiddleware],
		schema: {
			description:
				"Get the authenticated user's complete private profile, including 2FA status and Google user status.",
			tags: ['Users'],
			response: {
				200: UserPrivateProfileSchema,
				401: z.object().meta({ description: 'Authentication required' }),
				404: z.object().meta({ description: 'User not found' }),
				502: z.object().meta({ description: 'Auth service unreachable' })
			}
		},
		handler: getPrivateUser
	})

	server.route({
		method: 'PATCH',
		url: '/api/users/me',
		preHandler: [jwtAuthMiddleware],
		schema: {
			description:
				"Update the authenticated user's username. Username must be unique.",
			tags: ['Users'],
			body: UserProfileUpdateUsernameSchema,
			response: {
				200: z.object({ message: z.string() }),
				400: z.object().meta({ description: 'Invalid username format' }),
				401: z.object().meta({ description: 'Authentication required' }),
				404: z.object().meta({ description: 'User not found' }),
				409: z.object().meta({ description: 'Username already taken' })
			}
		},
		handler: updateUsername
	})

	server.route({
		method: 'PATCH',
		url: '/api/users/me/avatar',
		preHandler: [jwtAuthMiddleware],
		schema: {
			description:
				'Upload a new avatar image. Accepts JPEG or PNG, max 5MB. Automatically deletes old avatar.',
			tags: ['Users'],
			consumes: ['multipart/form-data', 'image/jpeg', 'image/png'],
			response: {
				200: z.object({ message: z.string() }),
				400: z
					.union([
						z.object().meta({ description: 'Invalid file type' }),
						z.object().meta({ description: 'File too large (max 5MB)' }),
						z.object().meta({ description: 'Missing file' })
					])
					.meta({ description: 'Bad request' }),
				401: z.object().meta({ description: 'Authentication required' }),
				500: z.object().meta({ description: 'Failed to save avatar' })
			}
		},
		handler: updateAvatar
	})

	server.route({
		method: 'PATCH',
		url: '/api/internal/users/:user_id/status',
		preHandler: [apiKeyMiddleware],
		schema: {
			description:
				'Internal endpoint for services to update user status (online, offline, in_game).',
			tags: ['Internal'],
			params: UserIdCoerceSchema,
			body: UpdateUserStatusSchema,
			response: {
				200: z.object({ message: z.string() }),
				400: z.object().meta({ description: 'Invalid user ID or status' }),
				401: z.object().meta({ description: 'Invalid API key' }),
				404: z.object().meta({ description: 'User not found' })
			}
		},
		handler: updateUserStatus
	})

	server.route({
		method: 'GET',
		url: '/api/users/search-by-username',
		preHandler: [jwtAuthMiddleware],
		schema: {
			description:
				'Search for a user by exact username match. Returns user ID, username and avatar.',
			tags: ['Users'],
			querystring: z.object({
				username: z
					.string()
					.min(4)
					.max(32)
					.describe('Exact username to search for')
			}),
			response: {
				200: UserSearchResultSchema,
				400: z.object().meta({ description: 'Invalid username format' }),
				401: z.object().meta({ description: 'Authentication required' }),
				404: z.object().meta({ description: 'User not found' })
			}
		},
		handler: searchUserByUsernameController
	})
}
