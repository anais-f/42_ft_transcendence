import Fastify from 'fastify'
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler,
	jsonSchemaTransform
} from 'fastify-type-provider-zod'
import { setupFastifyMonitoringHooks } from '@ft_transcendence/monitoring'
import metricPlugin from 'fastify-metrics'
import Swagger from '@fastify/swagger'
import SwaggerUI from '@fastify/swagger-ui'
import fs from 'fs'
import { Tournament } from '@ft_transcendence/common'

import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import { runMigrations } from './database/connection.js'
import { registerRoutes } from './routes/registerRoutes.js'

export const tournaments: Map<number, Tournament> = new Map()

const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()
const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) {
	throw new Error('JWT_SECRET environment variable is required')
}
console.log('Using JWT Secret:', jwtSecret)
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)
app.register(fastifyCookie)
app.register(fastifyJwt, {
	secret: jwtSecret,
	cookie: {
		cookieName: 'auth_token',
		signed: false
	}
})
setupFastifyMonitoringHooks(app)
async function runServer() {
	console.log('Starting Matchmaking service...')
	runMigrations()
	console.log('Database migrations completed')
	const openapiFilePath = process.env.DTO_OPENAPI_FILE
	if (!openapiFilePath) {
		throw new Error('DTO_OPENAPI_FILE is not defined in environment variables')
	}
	await app.register(metricPlugin.default, { endpoint: '/metrics' })
	const openapiSwagger = JSON.parse(fs.readFileSync(openapiFilePath, 'utf-8'))
	await app.register(Swagger, {
		openapi: {
			info: {
				title: 'API for Matchmaking Service',
				version: '1.0.0'
			},
			servers: [
				{ url: 'http:localhost:8080/matchmaking', description: 'Local server' }
			],
			components: openapiSwagger.components
		},
		transform: jsonSchemaTransform
	})
	await app.register(SwaggerUI, {
		routePrefix: '/docs'
	})

	await registerRoutes(app)

	const port = Number(process.env.PORT)
	const host = '0.0.0.0'

	await app.listen({ port, host })
	console.log(` Matchmaking service running on ${host}:${port}`)
}

runServer().catch((error) => {
	console.error('Failed to start Matchmaking service:', error)
	process.exit(1)
})
