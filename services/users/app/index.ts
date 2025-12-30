import './database/usersDatabase.js'
import Fastify, { FastifyInstance } from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyJwt from '@fastify/jwt'
import Swagger from '@fastify/swagger'
import SwaggerUI from '@fastify/swagger-ui'
import fastifyMultipart from '@fastify/multipart'
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler,
	jsonSchemaTransform
} from 'fastify-type-provider-zod'
import { usersRoutes } from './routes/usersRoutes.js'
import { UsersServices } from './usecases/usersServices.js'
import metricPlugin from 'fastify-metrics'
import { setupFastifyMonitoringHooks } from '@ft_transcendence/monitoring'
import { setupErrorHandler } from '@ft_transcendence/common'
import { env } from './env/checkEnv.js'
import { updateUserMetrics } from './usecases/metricsService.js'

function createApp(): FastifyInstance {
	const app = Fastify({
		logger: true,
		bodyLimit: 5 * 1024 * 1024
	}).withTypeProvider<ZodTypeProvider>()
	app.setValidatorCompiler(validatorCompiler)
	app.setSerializerCompiler(serializerCompiler)

	setupErrorHandler(app)

	setupFastifyMonitoringHooks(app)

	app.register(fastifyCookie)

	app.register(fastifyJwt, {
		secret: env.JWT_SECRET,
		cookie: {
			cookieName: 'auth_token',
			signed: false
		}
	})

	app.register(fastifyMultipart, {
		limits: {
			fileSize: 5 * 1024 * 1024,
			files: 1
		}
	})
	app.addContentTypeParser(
		/^image\/.*/,
		{ parseAs: 'buffer' },
		(request, payload: Buffer, done) => {
			done(null, payload)
		}
	)

	app.register(Swagger as any, {
		openapi: {
			info: {
				title: 'API for Users Service',
				version: '1.0.0'
			},
			servers: [{ url: `${env.HOST}/users`, description: 'Local server' }],
			components: env.openAPISchema.components
		},
		transform: jsonSchemaTransform
	})

	app.register(SwaggerUI as any, {
		routePrefix: '/docs'
	})

	app.register(usersRoutes)
	return app
}

async function initializeUsers(): Promise<void> {
	try {
		console.log('Initializing users from auth service...')
		await UsersServices.syncAllUsersFromAuth()
		console.log('User initialization complete.')
		updateUserMetrics()
	} catch (error) {
		console.error('Error initializing users:', error)
		throw error
	}
}

export async function start(): Promise<void> {
	const app = createApp()
	try {
		await app.register(metricPlugin.default, { endpoint: '/metrics' })
		await app.ready()
		await initializeUsers()
		await app.listen({
			port: 3000,
			host: '0.0.0.0'
		})
		console.log('Listening on port ', 3000)
		console.log(`Swagger UI available at ${env.HOST}/users/docs`)
	} catch (err) {
		console.error('Error starting server: ', err)
		process.exit(1)
	}
}

start()
