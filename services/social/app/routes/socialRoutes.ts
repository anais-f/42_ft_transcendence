import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import '@fastify/websocket'
import WebSocket from 'ws'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import { handleSocialWSConnection } from '../controllers/websocketControllers.js'
import {
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
				200: createTokenSchema
			}
		},
		handler: createTokenController
	})

	// GET /api/social/ws - WebSocket endpoint
	fastify.register(async (fastify) => {
		fastify.get(
			'/api/social/ws',
			{ websocket: true },
			(socket: WebSocket, request: FastifyRequest<IWsJwtTokenQuery>) => {
				handleSocialWSConnection(socket, request, fastify)
			}
		)
	})

	// POST /api/social/request-friend
	server.route({
		method: 'POST',
		url: '/api/social/request-friend',
		preHandler: jwtAuthMiddleware,
		schema: {
			body: UserIdCoerceSchema
		},
		handler: requestFriendController
	})

	// POST /api/social/accept-friend
	server.route({
		method: 'POST',
		url: '/api/social/accept-friend',
		preHandler: jwtAuthMiddleware,
		schema: {
			body: UserIdCoerceSchema
		},
		handler: acceptFriendController
	})

	// POST /api/social/reject-friend
	server.route({
		method: 'POST',
		url: '/api/social/reject-friend',
		preHandler: jwtAuthMiddleware,
		schema: {
			body: UserIdCoerceSchema
		},
		handler: rejectFriendController
	})

	// POST /api/social/cancel-request-friend
	server.route({
		method: 'POST',
		url: '/api/social/cancel-request-friend',
		preHandler: jwtAuthMiddleware,
		schema: {
			body: UserIdCoerceSchema
		},
		handler: cancelFriendController
	})

	// POST /api/social/remove-friend
	server.route({
		method: 'POST',
		url: '/api/social/remove-friend',
		preHandler: jwtAuthMiddleware,
		schema: {
			body: UserIdCoerceSchema
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
				200: FriendsListSchema
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
				200: PendingFriendsListSchema
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
				200: PendingFriendsListSchema
			}
		},
		handler: getPendingSentRequestsController
	})
}
