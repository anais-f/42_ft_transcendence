import Fastify from 'fastify'
import { runMigrations } from './database/connection.js'
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
import { env } from './env/index.js'

const app = Fastify({
	logger: true
}).withTypeProvider<ZodTypeProvider>()

app.register(cookie)
app.register(fastifyJwt, {
	secret: env.JWT_SECRET,
	cookie: {
		cookieName: 'auth_token',
		signed: false
	}
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

setupErrorHandler(app)
setupFastifyMonitoringHooks(app)

// readSecret now provided by @ft_transcendence/common

async function runServer() {
	console.log('Starting Auth service...')
	runMigrations()
	console.log('Admin user ensured')

	await app.register(metricPlugin.default, { endpoint: '/metrics' })
	await app.register(Swagger, {
		openapi: {
			info: {
				title: 'API for Auth Service',
				version: '1.0.0'
			},
			servers: [
				{ url: 'http://localhost:8080/auth', description: 'Local server' }
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

	// Vérifier les credentials Google (pour google-auth-library)
	if (env.GOOGLE_CLIENT_ID) {
		console.log(
			'Google Sign-In configured with Client ID:',
			env.GOOGLE_CLIENT_ID.substring(0, 20) + '...'
		)
	} else {
		console.warn('GOOGLE_CLIENT_ID not found, Google Sign-In will be disabled')
	}

	await registerRoutes(app)
	await app.listen({
		port: env.PORT,
		host: env.HOST
	})
	console.log('Auth service running on http://localhost:', env.PORT)
}

runServer().catch((err) => {
	app.log.error(err)
	process.exit(1)
})
