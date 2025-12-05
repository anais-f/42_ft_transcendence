import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import fastifyWebsocket from '@fastify/websocket' // this import isnt useless
import WebSocket from 'ws'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import { handleSocialWSConnection } from '../controllers/websocketControllers.js'
import { handleLogout } from '../controllers/logoutControllers.js'
import {
	ErrorResponseSchema,
	SuccessResponseSchema,
	FriendsListSchema,
	UserIdCoerceSchema,
	PendingFriendsListSchema,
	createTokenSchema,
	IWsJwtTokenQuery
} from '@ft_transcendence/common'
import { createTokenController } from '@ft_transcendence/security'
import {
	requestFriendController,
	rejectFriendController,
	acceptFriendController,
	cancelFriendController,
	removeFriendController,
	getFriendsListController,
	getPendingRequestsController,
	getPendingSentRequestsController
} from '../controllers/friendControllers.js'

export const socialRoutes: FastifyPluginAsync = async (fastify) => {
	const server = fastify.withTypeProvider<ZodTypeProvider>()

	// POST /api/social/create-token
	server.route({
		method: 'POST',
		url: '/api/social/create-token',
		preHandler: jwtAuthMiddleware,
		schema: {
			response: {
				200: createTokenSchema,
				401: ErrorResponseSchema
			}
		},
		handler: createTokenController
	})

	// GET /api/social/ws - WebSocket endpoint
	fastify.register(async (fastify) => {
		fastify.get<IWsJwtTokenQuery>(
			'/api/social/ws',
			{ websocket: true },
			(socket: WebSocket, request: FastifyRequest<IWsJwtTokenQuery>) => {
				handleSocialWSConnection(socket, request, fastify)
			}
		)
	})

	// POST /api/social/logout/me
	server.route({
		method: 'POST',
		url: '/api/social/logout/me',
		preHandler: jwtAuthMiddleware,
		schema: {
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

	// POST /api/social/request-friend
	server.route({
		method: 'POST',
		url: '/api/social/request-friend',
		preHandler: jwtAuthMiddleware,
		schema: {
			body: UserIdCoerceSchema,
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

	// POST /api/social/accept-friend
	server.route({
		method: 'POST',
		url: '/api/social/accept-friend',
		preHandler: jwtAuthMiddleware,
		schema: {
			body: UserIdCoerceSchema,
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

	// POST /api/social/reject-friend
	server.route({
		method: 'POST',
		url: '/api/social/reject-friend',
		preHandler: jwtAuthMiddleware,
		schema: {
			body: UserIdCoerceSchema,
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

	// POST /api/social/cancel-request-friend
	server.route({
		method: 'POST',
		url: '/api/social/cancel-request-friend',
		preHandler: jwtAuthMiddleware,
		schema: {
			body: UserIdCoerceSchema,
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

	// POST /api/social/remove-friend
	server.route({
		method: 'POST',
		url: '/api/social/remove-friend',
		preHandler: jwtAuthMiddleware,
		schema: {
			body: UserIdCoerceSchema,
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

	// GET /api/social/friends-list/me
	server.route({
		method: 'GET',
		url: '/api/social/friends-list/me',
		preHandler: jwtAuthMiddleware,
		schema: {
			response: {
				200: FriendsListSchema,
				400: ErrorResponseSchema,
				401: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		},
		handler: getFriendsListController
	})

	// GET /api/social/pending-requests/me
	server.route({
		method: 'GET',
		url: '/api/social/pending-requests/me',
		preHandler: jwtAuthMiddleware,
		schema: {
			response: {
				200: PendingFriendsListSchema,
				400: ErrorResponseSchema,
				401: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		},
		handler: getPendingRequestsController
	})

	// GET /api/social/requests-sent/me
	server.route({
		method: 'GET',
		url: '/api/social/requests-sent/me',
		preHandler: jwtAuthMiddleware,
		schema: {
			response: {
				200: PendingFriendsListSchema,
				400: ErrorResponseSchema,
				401: ErrorResponseSchema,
				500: ErrorResponseSchema
			}
		},
		handler: getPendingSentRequestsController
	})
}
