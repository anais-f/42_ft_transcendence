import Fastify, { FastifyRequest, FastifyReply } from 'fastify'
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
import fs from 'fs'
import metricPlugin from 'fastify-metrics'
import {
	httpRequestCounter,
	responseTimeHistogram
} from '@ft_transcendence/common'
import { findPublicUserByLogin } from './repositories/userRepository.js'
import { registerAdminUser } from './usecases/register.js'
import cookie from '@fastify/cookie'
import { readSecret } from '@ft_transcendence/common'

const app = Fastify({
	logger: true
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.decorateRequest('startTime', null)

app.addHook(
	'onRequest',
	(request: FastifyRequest, reply: FastifyReply, done) => {
		request.startTime = process.hrtime()
		done()
	}
)

app.addHook('onResponse', (request, reply) => {
	httpRequestCounter.inc({
		method: request.method,
		route: request.url,
		status_code: reply.statusCode
	})
	const startTime = request.startTime
	if (startTime) {
		const diff = process.hrtime(startTime)
		const responseTimeInSeconds = diff[0] + diff[1] / 1e9
		responseTimeHistogram.observe(
			{
				method: request.method,
				route: request.url,
				status_code: reply.statusCode
			},
			responseTimeInSeconds
		)
	}
})

// readSecret now provided by @ft_transcendence/common

async function runServer() {
	console.log('Starting Auth service...')
	runMigrations()
	console.log('Admin user ensured')

	const openapiFilePath = process.env.DTO_OPENAPI_FILE
	// prefer env variables for CI/local, fall back to docker secrets if present
	const login_admin =
		process.env.LOGIN_ADMIN || readSecret('login_admin') || undefined
	const password_admin =
		process.env.PASSWORD_ADMIN || readSecret('password_admin') || undefined
	if (!login_admin || !password_admin) {
		throw new Error(
			'Admin credentials are not defined. Set LOGIN_ADMIN and PASSWORD_ADMIN in your .env or Docker secrets. See .env.example'
		)
	}
	if (!openapiFilePath) {
		throw new Error('DTO_OPENAPI_FILE is not defined in environment variables')
	}
	await app.register(metricPlugin.default, { endpoint: '/metrics' })
	const openapiSwagger = JSON.parse(fs.readFileSync(openapiFilePath, 'utf-8'))
	await app.register(Swagger, {
		openapi: {
			info: {
				title: 'API for Auth Service',
				version: '1.0.0'
			},
			servers: [
				{ url: 'http://localhost:8080/auth', description: 'Local server' }
			],
			components: openapiSwagger.components
		},
		transform: jsonSchemaTransform
	})
	await app.register(SwaggerUI, {
		routePrefix: '/docs'
	})
	if (findPublicUserByLogin('admin') === undefined) {
		registerAdminUser(login_admin, password_admin)
	}
	await app.register(cookie, { secret: 'test', parseOptions: {} })
	await registerRoutes(app)
	const port = Number(process.env.PORT)
	if (!port) {
		throw new Error('PORT is not defined in environment variables')
	}
	await app.listen({
		port: port,
		host: '0.0.0.0'
	})
	console.log('Auth service running on http://localhost:', port)
}

runServer().catch((err) => {
	app.log.error(err)
	process.exit(1)
})
