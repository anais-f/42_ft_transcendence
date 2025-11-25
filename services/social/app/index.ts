import './database/socialDatabase.js'
import Fastify, { FastifyInstance } from 'fastify'
import Swagger from '@fastify/swagger'
import SwaggerUI from '@fastify/swagger-ui'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import FastifyWebSocket from '@fastify/websocket'
import fs from 'fs'
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler,
	jsonSchemaTransform
} from 'fastify-type-provider-zod'
import metricPlugin from 'fastify-metrics'
import {
	httpRequestCounter,
	responseTimeHistogram
} from '@ft_transcendence/common'
import { socialRoutes } from './routes/socialRoutes.js'

const OPENAPI_FILE = process.env.DTO_OPENAPI_FILE as string
const HOST = process.env.HOST || 'http://localhost:8080'

function createApp(): FastifyInstance {
	const app = Fastify({
		logger: true
	}).withTypeProvider<ZodTypeProvider>()
	app.setValidatorCompiler(validatorCompiler)
	app.setSerializerCompiler(serializerCompiler)

	const jwtSecret = process.env.JWT_SECRET_SOCIAL
	if (!jwtSecret) {
		throw new Error('JWT_SECRET environment variable is required')
	}
	app.register(fastifyJwt, {
		secret: jwtSecret
	})

	app.register(fastifyCookie)

	const openapiSwagger = loadOpenAPISchema()
	app.register(Swagger as any, {
		openapi: {
			info: {
				title: 'API for Social Service',
				version: '1.0.0'
			},
			servers: [{ url: `${HOST}/social`, description: 'Local server' }],
			components: openapiSwagger.components
		},
		transform: jsonSchemaTransform
	})

	app.register(SwaggerUI as any, {
		routePrefix: '/docs'
	})

	app.register(FastifyWebSocket as any)

	app.register(socialRoutes)

	return app
}

export async function start(): Promise<void> {
	const app = createApp()
	app.addHook('onRequest', (request, reply, done) => {
		;(request as any).startTime = process.hrtime()
		done()
	})

	app.addHook('onResponse', (request, reply) => {
		httpRequestCounter.inc({
			method: request.method,
			route: request.url,
			status_code: reply.statusCode
		})
		const startTime = (request as any).startTime
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
	try {
		await app.register(metricPlugin.default, { endpoint: '/metrics' })
		await app.ready()
		await app.listen({
			port: parseInt(process.env.PORT as string),
			host: '0.0.0.0'
		})
		console.log('Listening on port ', process.env.PORT)
		console.log(`Swagger UI available at ${HOST}/social/docs`)
	} catch (err) {
		console.error('Error starting server: ', err)
		process.exit(1)
	}
}

function loadOpenAPISchema() {
	try {
		if (!fs.existsSync(OPENAPI_FILE)) {
			console.warn(
				`OpenAPI DTO file not found at ${OPENAPI_FILE} - continuing without OpenAPI components`
			)
			return { components: {} }
		}

		const schemaData = fs.readFileSync(OPENAPI_FILE, 'utf-8')
		return JSON.parse(schemaData)
	} catch (error) {
		console.error('Error loading OpenAPI schema:', error)
		return { components: {} }
	}
}

start()
