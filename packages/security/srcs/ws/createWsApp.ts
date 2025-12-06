import SwaggerUI from '@fastify/swagger-ui'
import FastifyWebSocket from '@fastify/websocket'
import Swagger from '@fastify/swagger'
import fastifyCookie from '@fastify/cookie'
import Fastify, { FastifyInstance } from 'fastify'
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler
} from 'fastify-type-provider-zod'
import fastifyJwt from '@fastify/jwt'

export function createWsApp(
	appRoutes: any,
	swager_data: any,
	jwtSecret: string
): FastifyInstance {
	if (!jwtSecret) {
		throw new Error('bad JWT secret')
	}

	const app = Fastify({ logger: true })
		.withTypeProvider<ZodTypeProvider>()
		.setValidatorCompiler(validatorCompiler)
		.setSerializerCompiler(serializerCompiler)
		.register(fastifyCookie)
		.register(fastifyJwt, {
			secret: jwtSecret,
			cookie: {
				cookieName: 'auth_token',
				signed: false
			}
		})
		.register(Swagger as any, swager_data)
		.register(SwaggerUI as any, {
			routePrefix: '/docs'
		})
		.register(FastifyWebSocket as any)
		.register(appRoutes as any)

	return app
}
