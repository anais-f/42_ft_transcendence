import './database/socialDatabase.js'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'
import metricPlugin from 'fastify-metrics'

import { socialRoutes } from './routes/socialRoutes.js'
import { loadOpenAPISchema } from '@ft_transcendence/common'
import { createWsApp } from '@ft_transcendence/security'

const HOST = process.env.HOST || 'http://localhost:8080'

const openapiSwagger = loadOpenAPISchema(process.env.DTO_OPENAPI_FILE as string)
export async function start(): Promise<void> {
	const app = createWsApp(
		socialRoutes,
		{
			openapi: {
				info: {
					title: 'API for Social Service',
					version: '1.0.0'
				},
				servers: [{ url: `${HOST}/social`, description: 'Local server' }],
				components: openapiSwagger.components
			},
			transform: jsonSchemaTransform
		},
		process.env.JWT_SECRET_SOCIAL as string
	)

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

start()
