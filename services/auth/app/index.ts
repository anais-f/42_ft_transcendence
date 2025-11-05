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
import metricPlugin from 'fastify-metrics'
import { httpRequestCounter, responseTimeHistogram } from '@ft_transcendence/common'

const app = Fastify({
	logger: true
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.addHook('onRequest', (request, reply, done) => {
	(request as any).startTime = process.hrtime();
	done();
});

app.addHook('onResponse', (request, reply) => {
	httpRequestCounter.inc({
		method: request.method,
		route: request.url,
		status_code: reply.statusCode
	});
	const startTime = (request as any).startTime;
 	if (startTime) {
		const diff = process.hrtime(startTime);
		const responseTimeInSeconds = diff[0] + diff[1] / 1e9;
		responseTimeHistogram.observe({
		method: request.method,
		route: request.url,
		status_code: reply.statusCode
	}, responseTimeInSeconds);
  } 
});

async function runServer() {
	console.log('Starting Auth service...')
	await runMigrations()

	await app.register(metricPlugin.default, { endpoint: '/metrics' });
	// Load OpenAPI schemas from file
	const openapiSwagger = JSON.parse(
		fs.readFileSync(
			process.env.OPEN_API_FILE as string,
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
