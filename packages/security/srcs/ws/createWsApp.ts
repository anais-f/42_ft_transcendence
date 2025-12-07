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

interface JwtSecrets {
	main: string
	service: string
}

export function createWsApp(
	appRoutes: any,
	swager_data: any,
	jwtSecrets: JwtSecrets
): FastifyInstance {
	if (!jwtSecrets.main || !jwtSecrets.service) {
		throw new Error('Missing JWT secrets')
	}

	const app = Fastify({ logger: true })
		.withTypeProvider<ZodTypeProvider>()
		.setValidatorCompiler(validatorCompiler)
		.setSerializerCompiler(serializerCompiler)

		.register(fastifyCookie)

		.register(fastifyJwt, {
			secret: jwtSecrets.main,
			cookie: {
				cookieName: 'auth_token',
				signed: false
			}
		})

		.register(fastifyJwt, {
			secret: jwtSecrets.service,
			namespace: 'ws'
		})

		.register(Swagger as any, swager_data)
		.register(SwaggerUI as any, {
			routePrefix: '/docs'
		})
		.register(FastifyWebSocket as any)
		.register(appRoutes as any)

	return app
}
