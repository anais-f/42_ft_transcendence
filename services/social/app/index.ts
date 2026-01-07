import './database/socialDatabase.js'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'
import metricPlugin from 'fastify-metrics'

import { socialRoutes } from './routes/socialRoutes.js'
import { createWsApp } from '@ft_transcendence/security'
import { startHeartbeat } from './usecases/heartbeatService.js'
import { env } from './env/checkEnv.js'
import { setupFastifyMonitoringHooks } from '@ft_transcendence/monitoring'

export async function start(): Promise<void> {
	const app = createWsApp(
		socialRoutes,
		{
			openapi: {
				info: {
					title: 'API for Social Service',
					version: '1.0.0'
				},
				servers: [
					{
						url: `${env.SWAGGER_HOST}:8080/social`,
						description: 'Local server'
					}
				],
				components: env.openAPISchema.components
			},
			transform: jsonSchemaTransform
		},
		{
			main: env.JWT_SECRET,
			service: env.JWT_SECRET_SOCIAL
		}
	)
	setupFastifyMonitoringHooks(app)
	try {
		await app.register(metricPlugin.default, { endpoint: '/metrics' })
		await app.ready()
		await app.listen({
			port: 3000,
			host: '0.0.0.0'
		})
		console.log('Listening on port ', 3000)
		console.log(`Swagger UI available at ${env.SWAGGER_HOST}/social/docs`)

		startHeartbeat()
		console.log('WebSocket heartbeat monitoring started')
	} catch (err) {
		console.error('Error starting server: ', err)
		process.exit(1)
	}
}

start()
