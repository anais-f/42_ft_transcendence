import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import WebSocket from 'ws'
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
	ErrorResponseSchema,
	SuccessResponseSchema,
	LogoutParamsSchema
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
	server.route({
		method: 'POST',
		url: '/api/social/create-token',
		preHandler: jwtAuthMiddleware,
		schema: {
			response: {
				200: z.object({ token: z.string() })
			}
		},
		handler: createTokenController
	})

	// GET /api/ws - WebSocket endpoint (WS token required)
	// Register websocket without type provider (raw Fastify websocket)
	fastify.register(async (fastify) => {
		fastify.get<{ Querystring: { token: string } }>(
			'/api/social/ws',
			{ websocket: true },
			(
				socket: WebSocket,
				request: FastifyRequest<{ Querystring: { token: string } }>
			) => {
				handleWsConnection(socket, request, fastify)
			}
		)
	})

	// POST /api/logout/:userId - Mark user as offline (JWT required, can only logout self)
	server.route({
		method: 'POST',
		url: '/api/social/logout/:userId',
		preHandler: jwtAuthOwnerMiddleware,
		schema: {
			params: LogoutParamsSchema,
			response: {
				200: SuccessResponseSchema,
				400: ErrorResponseSchema,
				401: ErrorResponseSchema,
				403: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		},
		handler: handleLogout
	})

	// POST /api/request-friend - Send a friend request (JWT required)
	server.route({
		method: 'POST',
		url: '/api/social/request-friend',
		preHandler: jwtAuthMiddleware,
		schema: {
			body: UserIdSchema,
			response: {
				200: SuccessResponseSchema,
				400: ErrorResponseSchema,
				401: ErrorResponseSchema,
				404: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		},
		handler: requestFriendController
	})

	// POST /api/accept-friend - Accept a friend request (JWT required)
	server.route({
		method: 'POST',
		url: '/api/social/accept-friend',
		preHandler: jwtAuthMiddleware,
		schema: {
			body: UserIdSchema,
			response: {
				200: SuccessResponseSchema,
				400: ErrorResponseSchema,
				401: ErrorResponseSchema,
				404: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		},
		handler: acceptFriendController
	})

	// POST /api/reject-friend - Reject a friend request (JWT required)
	server.route({
		method: 'POST',
		url: '/api/social/reject-friend',
		preHandler: jwtAuthMiddleware,
		schema: {
			body: UserIdSchema,
			response: {
				200: SuccessResponseSchema,
				400: ErrorResponseSchema,
				401: ErrorResponseSchema,
				404: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		},
		handler: rejectFriendController
	})

	// POST /api/cancel-friend - Cancel a friend request (JWT required)
	server.route({
		method: 'POST',
		url: '/api/social/cancel-friend',
		preHandler: jwtAuthMiddleware,
		schema: {
			body: UserIdSchema,
			response: {
				200: SuccessResponseSchema,
				400: ErrorResponseSchema,
				401: ErrorResponseSchema,
				404: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		},
		handler: cancelFriendController
	})

	// POST /api/remove-friend - Remove a friend (JWT required)
	server.route({
		method: 'POST',
		url: '/api/social/remove-friend',
		preHandler: jwtAuthMiddleware,
		schema: {
			body: UserIdSchema,
			response: {
				200: SuccessResponseSchema,
				400: ErrorResponseSchema,
				401: ErrorResponseSchema,
				404: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		},
		handler: removeFriendController
	})

	// TODO : routes for friends list, friend requests list, etc.
}
