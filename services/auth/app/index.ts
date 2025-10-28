import Fastify, { FastifyRequest } from 'fastify'
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
import path from 'path'

const app = Fastify({
	logger: true
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

async function runServer() {
	console.log('Starting Auth service...')
	await runMigrations()

	// Load OpenAPI schemas from file
	const openapiSwagger = JSON.parse(
		fs.readFileSync(
			process.env.DTO_OPENAPI_FILE as string,
			'utf-8'
		)
	)

	// Configure Swagger to use the loaded schemas
	await app.register(Swagger as any, {
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

	await app.register(SwaggerUI as any, {
		routePrefix: '/docs'
	})

	await registerRoutes(app)
	await app.listen({
		port: parseInt(process.env.PORT as string),
		host: '0.0.0.0'
	})
	console.log('Auth service running on http://localhost:', process.env.PORT)
}

runServer().catch((err) => {
	app.log.error(err)
	process.exit(1)
})
