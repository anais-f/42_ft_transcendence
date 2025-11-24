import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import {
	jwtAuthMiddleware,
	jwtAuthOwnerMiddleware
} from '@ft_transcendence/security'
import { z } from 'zod'
import { createTokenController } from '../controllers/tokenControllers.js'
import { handleWsConnection } from '../controllers/websocketControllers.js'
import { handleLogout } from '../controllers/logoutControllers.js'
import {
	UserIdSchema,
	wsQuerySchema,
	ErrorResponseSchema,
	SuccessResponseSchema
} from '@ft_transcendence/common'
import {
	requestFriendController,
	rejectFriendController,
	acceptFriendController,
	cancelFriendController,
	removeFriendController
} from '../controllers/friendControllers.js'

export const socialRoutes: FastifyPluginAsync = async (fastify) => {
	const server = fastify.withTypeProvider<ZodTypeProvider>()

	// POST /api/create-token - Create temporary WS token (JWT required)
	await server.route({
		method: 'POST',
		url: '/api/social/create-token',
		preHandler: jwtAuthMiddleware,
		handler: createTokenController,
		schema: {}
	})

	// GET /api/ws - WebSocket endpoint (WS token required)
	await server.route({
		method: 'GET',
		url: '/api/social/ws',
		websocket: true,
		schema: {
			querystring: wsQuerySchema
		},
		handler: (socket: any, request: FastifyRequest<{ Querystring: { token: string } }>) =>
			handleWsConnection(socket, request, fastify)
	})

	// POST /api/logout/:userId - Mark user as offline (JWT required, can only logout self)
	await server.route({
		method: 'POST',
		url: '/api/social/logout/:userId',
		preHandler: jwtAuthOwnerMiddleware,
		handler: handleLogout,
		schema: {
			params: z.object({ userId: z.coerce.number().int().positive().min(1) }),
			response: {
				200: SuccessResponseSchema,
				400: ErrorResponseSchema,
				401: ErrorResponseSchema,
				403: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		}
	})

	// POST /api/request-friend - Send a friend request (JWT required)
	await server.route({
		method: 'POST',
		url: '/api/social/request-friend',
		preHandler: jwtAuthMiddleware,
		handler: requestFriendController,
		schema: {
			body: UserIdSchema,
			response: {
				200: SuccessResponseSchema,
				400: ErrorResponseSchema,
				401: ErrorResponseSchema,
				404: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		}
	})

	// POST /api/accept-friend - Accept a friend request (JWT required)
	await server.route({
		method: 'POST',
		url: '/api/social/accept-friend',
		preHandler: jwtAuthMiddleware,
		handler: acceptFriendController,
		schema: {
			body: UserIdSchema,
			response: {
				200: SuccessResponseSchema,
				400: ErrorResponseSchema,
				401: ErrorResponseSchema,
				404: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		}
	})

	// POST /api/reject-friend - Reject a friend request (JWT required)
	await server.route({
		method: 'POST',
		url: '/api/social/reject-friend',
		preHandler: jwtAuthMiddleware,
		handler: rejectFriendController,
		schema: {
			body: UserIdSchema,
			response: {
				200: SuccessResponseSchema,
				400: ErrorResponseSchema,
				401: ErrorResponseSchema,
				404: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		}
	})

	// POST /api/cancel-friend - Cancel a friend request (JWT required)
	await server.route({
		method: 'POST',
		url: '/api/social/cancel-friend',
		preHandler: jwtAuthMiddleware,
		handler: cancelFriendController,
		schema: {
			body: UserIdSchema,
			response: {
				200: SuccessResponseSchema,
				400: ErrorResponseSchema,
				401: ErrorResponseSchema,
				404: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		}
	})

	// POST /api/remove-friend - Remove a friend (JWT required)
	await server.route({
		method: 'POST',
		url: '/api/social/remove-friend',
		preHandler: jwtAuthMiddleware,
		handler: removeFriendController,
		schema: {
			body: UserIdSchema,
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
