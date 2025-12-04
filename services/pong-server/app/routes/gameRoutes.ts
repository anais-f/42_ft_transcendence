import { FastifyPluginAsync } from 'fastify'
import { jwtAuthMiddleware } from '@ft_transcendence/security'
import { createTokenController } from '@ft_transcendence/security'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { createTokenSchema, ErrorResponseSchema } from '@ft_transcendence/common'

export const gameRoutes: FastifyPluginAsync = async (fastify) => {
	const server = fastify.withTypeProvider<ZodTypeProvider>()

	server.route({
		method: 'POST',
		url: '/api/pong-server/create-token',
		preHandler: jwtAuthMiddleware,
		schema: {
			response: {
				200: createTokenSchema,
				401: ErrorResponseSchema
			}
		},
		handler: createTokenController
	})
}
