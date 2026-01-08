import Fastify from 'fastify'
import { initDB } from './database/connection.js'
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler,
	jsonSchemaTransform
} from 'fastify-type-provider-zod'
import { registerRoutes } from './routes/registerRoutes.js'
import Swagger from '@fastify/swagger'
import SwaggerUI from '@fastify/swagger-ui'
import metricPlugin from 'fastify-metrics'
import { setupFastifyMonitoringHooks } from '@ft_transcendence/monitoring'
import { findPublicUserByLogin } from './repositories/userRepository.js'
import { registerAdminUser } from './usecases/register.js'
import cookie from '@fastify/cookie'
import fastifyJwt from '@fastify/jwt'
import { setupErrorHandler } from '@ft_transcendence/common'
import { env } from './env/checkEnv.js'

const app = Fastify({
	logger: true
}).withTypeProvider<ZodTypeProvider>()

app.register(cookie)
app.register(fastifyJwt, {
	secret: env.JWT_SECRET_AUTH,
	cookie: {
		cookieName: 'auth_token',
		signed: false
	}
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

setupErrorHandler(app)
setupFastifyMonitoringHooks(app)

async function runServer() {
	initDB()

	await app.register(metricPlugin.default, { endpoint: '/metrics' })
	await app.register(Swagger, {
		openapi: {
			info: {
				title: 'API for Auth Service',
				version: '1.0.0'
			},
			servers: [
				{
					url: `${env.SWAGGER_HOST}:${env.PORT}/auth`,
					description: 'Local server'
				}
			],
			components: env.openAPISchema.components
		},
		transform: jsonSchemaTransform
	})
	await app.register(SwaggerUI, {
		routePrefix: '/docs'
	})

	if (findPublicUserByLogin(env.LOGIN_ADMIN) === undefined) {
		registerAdminUser(env.LOGIN_ADMIN, env.PASSWORD_ADMIN)
	}

	await registerRoutes(app)
	await app.listen({
		port: 3000,
		host: '0.0.0.0'
	})
	app.log.info('Auth service started on port 3000')
}

runServer().catch((err) => {
	app.log.error(err)
	process.exit(1)
})
