import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import '@fastify/websocket'
import WebSocket from 'ws'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import { handleSocialWSConnection } from '../controllers/websocketControllers.js'
import {
	FriendsListSchema,
	UserIdCoerceSchema,
	PendingFriendsListSchema,
	createTokenSchema,
	IWsJwtTokenQuery,
	HttpErrorSchema
} from '@ft_transcendence/common'
import { createTokenController } from '@ft_transcendence/security'
import {
	requestFriendController,
	rejectFriendController,
	acceptFriendController,
	removeFriendController,
	getFriendsListController,
	getPendingRequestsController,
	getPendingSentRequestsController,
	isFriendController
} from '../controllers/friendControllers.js'

export const socialRoutes: FastifyPluginAsync = async (fastify) => {
	const server = fastify.withTypeProvider<ZodTypeProvider>()

	server.route({
		method: 'POST',
		url: '/api/social/create-token',
		preHandler: jwtAuthMiddleware,
		schema: {
			description:
				'Create a temporary JWT for connecting to the social service WebSocket endpoint.',
			tags: ['Social'],
			response: {
				201: createTokenSchema,
				401: HttpErrorSchema.meta({ description: 'Authentication required' })
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

	server.route({
		method: 'POST',
		url: '/api/social/request-friend',
		preHandler: jwtAuthMiddleware,
		schema: {
			description:
				'Send a friend request to another user. Auto-accepts if the other user already sent a request.',
			tags: ['Friends'],
			body: UserIdCoerceSchema,
			response: {
				200: z.object({ message: z.string() }),
				400: HttpErrorSchema.meta({
					description:
						"Can't add yourself / Already friends / Friend request already sent / Friend limit reached"
				}),
				401: HttpErrorSchema.meta({ description: 'Authentication required' }),
				404: HttpErrorSchema.meta({ description: 'Friend user not found' })
			}
		},
		handler: requestFriendController
	})

	server.route({
		method: 'POST',
		url: '/api/social/accept-friend',
		preHandler: jwtAuthMiddleware,
		schema: {
			description: 'Accept an incoming friend request.',
			tags: ['Friends'],
			body: UserIdCoerceSchema,
			response: {
				200: z.object({ message: z.string() }),
				400: HttpErrorSchema.meta({
					description:
						"Can't accept yourself / Already friends / No pending request / Friend limit reached"
				}),
				401: HttpErrorSchema.meta({ description: 'Authentication required' }),
				404: HttpErrorSchema.meta({ description: 'Friend user not found' })
			}
		},
		handler: acceptFriendController
	})

	server.route({
		method: 'POST',
		url: '/api/social/reject-friend',
		preHandler: jwtAuthMiddleware,
		schema: {
			description: 'Reject an incoming friend request.',
			tags: ['Friends'],
			body: UserIdCoerceSchema,
			response: {
				200: z.object({ message: z.string() }),
				400: HttpErrorSchema.meta({
					description: "Can't reject yourself / No pending request"
				}),
				401: HttpErrorSchema.meta({ description: 'Authentication required' }),
				404: HttpErrorSchema.meta({ description: 'Friend user not found' })
			}
		},
		handler: rejectFriendController
	})

	server.route({
		method: 'POST',
		url: '/api/social/remove-friend',
		preHandler: jwtAuthMiddleware,
		schema: {
			description: 'Remove an existing friend.',
			tags: ['Friends'],
			body: UserIdCoerceSchema,
			response: {
				200: z.object({ message: z.string() }),
				400: HttpErrorSchema.meta({
					description: "Can't remove yourself / Not friends"
				}),
				401: HttpErrorSchema.meta({ description: 'Authentication required' }),
				404: HttpErrorSchema.meta({ description: 'Friend user not found' })
			}
		},
		handler: removeFriendController
	})

	server.route({
		method: 'GET',
		url: '/api/social/friends-list/me',
		preHandler: jwtAuthMiddleware,
		schema: {
			description:
				"Get the authenticated user's complete friends list with profiles (username, avatar, status, last connection).",
			tags: ['Friends'],
			response: {
				200: FriendsListSchema,
				401: HttpErrorSchema.meta({ description: 'Authentication required' }),
				404: HttpErrorSchema.meta({ description: 'User not found' })
			}
		},
		handler: getFriendsListController
	})

	server.route({
		method: 'GET',
		url: '/api/social/pending-requests/me',
		preHandler: jwtAuthMiddleware,
		schema: {
			description:
				'Get pending friend requests that the authenticated user needs to approve (incoming requests).',
			tags: ['Friends'],
			response: {
				200: PendingFriendsListSchema,
				401: HttpErrorSchema.meta({ description: 'Authentication required' }),
				404: HttpErrorSchema.meta({ description: 'User not found' })
			}
		},
		handler: getPendingRequestsController
	})

	server.route({
		method: 'GET',
		url: '/api/social/requests-sent/me',
		preHandler: jwtAuthMiddleware,
		schema: {
			description:
				'Get pending friend requests sent by the authenticated user (outgoing requests).',
			tags: ['Friends'],
			response: {
				200: PendingFriendsListSchema,
				401: HttpErrorSchema.meta({ description: 'Authentication required' }),
				404: HttpErrorSchema.meta({ description: 'User not found' })
			}
		},
		handler: getPendingSentRequestsController
	})

	server.route({
		method: 'GET',
		url: '/api/social/is-friend/:user_id',
		preHandler: jwtAuthMiddleware,
		schema: {
			description:
				'Check if the authenticated user is friends with another user.',
			tags: ['Friends'],
			params: UserIdCoerceSchema,
			response: {
				200: z
					.object({
						status: z.number().optional()
					})
					.meta({ description: 'Friendship status between users' }),
				400: HttpErrorSchema.meta({ description: 'Invalid user ID' }),
				401: HttpErrorSchema.meta({ description: 'Authentication required' })
			}
		},
		handler: isFriendController
	})
}
