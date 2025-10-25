import Fastify from 'fastify'
import { runMigrations } from './database/connection.js'
import { registerRoutes } from './routes/registerRoutes.js'
import { ENV } from './config/env.js'
import Swagger from '@fastify/swagger'
import SwaggerUI from '@fastify/swagger-ui'
import fs from 'fs'
import path from 'path'
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler,
	jsonSchemaTransform
} from 'fastify-type-provider-zod'

const app = Fastify({
	logger: true
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

async function runServer() {
	await runMigrations()

	// Load OpenAPI schemas from common package
	const openapiSwagger = JSON.parse(
		fs.readFileSync(path.join(process.cwd(), './dist/openapiDTO.json'), 'utf-8')
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
	await app.listen({ port: ENV.PORT, host: '0.0.0.0' })
	console.log('Auth service running on http://localhost:', ENV.PORT)
}
runServer().catch((err) => {
	app.log.error(err)
	process.exit(1)
})
