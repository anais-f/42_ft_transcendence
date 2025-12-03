import { FastifyPluginAsync } from "fastify";
import {  jwtAuthMiddleware } from '@ft_transcendence/security'
import { createTokenController } from '@ft_transcendence/common'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const gameRoutes: FastifyPluginAsync = async (fastify) => {
	const server = fastify.withTypeProvider<ZodTypeProvider>()

	
	server.route({
		method: 'POST',
		url: '/api/game/create-token',
		preHandler: jwtAuthMiddleware,
		schema: {
			response: {
				200: z.object({
					wsToken: z.string(),
					expiresIn: z.number().int().nonnegative()
				})
			}
		},
		handler: createTokenController
	})


}
