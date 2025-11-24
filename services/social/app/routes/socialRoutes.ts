import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { jwtAuthMiddleware, jwtAuthOwnerMiddleware } from '@ft_transcendence/security'
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
import WebSocket from 'ws'
import { requestFriendController, rejectFriendController, acceptFriendController, cancelFriendController, removeFriendController } from '../controllers/friendControllers.js'


export const socialRoutes: FastifyPluginAsync = async (fastify) => {
	const server = fastify.withTypeProvider<ZodTypeProvider>()

	// POST /api/create-token - Create temporary WS token (JWT required)
	server.post(
		'/api/social/create-token',
		{
			preHandler: [jwtAuthMiddleware]
		},
		createTokenController
	)

  //TODO : revoir le WS token, le faire expirer et voir le prehandler JWT

  // GET /api/ws - WebSocket endpoint (WS token required)
	server.get(
		'/api/social/ws',
		{
			websocket: true,
			schema: {
				querystring: wsQuerySchema
			}
		},
		(
			socket: WebSocket,
			request: FastifyRequest<{ Querystring: { token: string } }>
		) => handleWsConnection(socket, request, fastify)
	)

	// POST /api/logout/:userId - Mark user as offline (JWT required, can only logout self)
	server.post<{ Params: { userId: number } }>(
		'/api/social/logout/:userId',
		{
			schema: {
				params: z.object({ userId: z.coerce.number().int().positive().min(1) }),
				response: {
					200: SuccessResponseSchema,
					400: ErrorResponseSchema,
					401: ErrorResponseSchema,
					403: ErrorResponseSchema,
					500: ErrorResponseSchema
				}
			},
			preHandler: [jwtAuthOwnerMiddleware]
		},
		handleLogout
	)

  // POST /api/request-friend - Send a friend request (JWT required)
  server.post(
    '/api/social/request-friend',
    {
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
      preHandler: [jwtAuthMiddleware]
    },
    requestFriendController
  )

  // POST /api/accept-friend - Accept a friend request (JWT required)
  server.post(
    '/api/social/accept-friend',
    {
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
      preHandler: [jwtAuthMiddleware]
    },
    acceptFriendController
  )

  server.post(
    '/api/social/reject-friend',
    {
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
      preHandler: [jwtAuthMiddleware]
    },
    rejectFriendController
  )

  server.post(
    '/api/social/cancel-friend',
    {
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
      preHandler: [jwtAuthMiddleware]
    },
    cancelFriendController
  )

  server.post(
    '/api/social/remove-friend',
    {
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
      preHandler: [jwtAuthMiddleware]
    },
    removeFriendController
  )


            // GET /api/friends - Get friend list (JWT required)
  // server.get(
  //   '/api/social/friends',
  //   {
  //     preHandler: [jwtAuthMiddleware]
  //   },
  //   async (request, reply) => {
  //     // Placeholder implementation
  //     reply.send({ friends: [] }) // Return empty friend list as placeholder
  //   }
  // )

  // GET /api/friend-requests - Get incoming friend requests (JWT required)
  // server.get(
  //   '/api/social/friend-requests',
  //   {
  //     preHandler: [jwtAuthMiddleware]
  //   },
  //   async (request, reply) => {
  //     // Placeholder implementation
  //     reply.send({ requests: [] }) // Return empty requests list as placeholder
  //   }
  // )
}
