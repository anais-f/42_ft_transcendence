import { jsonSchemaTransform } from 'fastify-type-provider-zod'
import { createWsApp } from '@ft_transcendence/security'
import { registerRoutes } from './routes/registerRoutes.js'
import { env } from './env/checkEnv.js'
import { setupFastifyMonitoringHooks } from '@ft_transcendence/monitoring'
import { initDB } from './database/connection.js'
import { gameRoutes } from './routes/gameRoutes.js'
import metricPlugin from 'fastify-metrics'

initDB()

async function start(): Promise<void> {
	const app = createWsApp(
		gameRoutes,
		{
			openapi: {
				info: {
					title: 'game/tournament API',
					version: '1.0.0'
				},
				servers: [
					{
						url: `${env.SWAGGER_HOST}:8080/game`,
						description: 'Local server'
					}
				],
				components: env.openAPISchema.components
			},
			transform: jsonSchemaTransform
		},
		{
			main: env.JWT_SECRET_AUTH,
			service: env.JWT_SECRET_GAME
		}
	)
	setupFastifyMonitoringHooks(app)
	await registerRoutes(app)

	try {
		await app.register(metricPlugin.default, { endpoint: '/metrics' })
		await app.ready()
		await app.listen({
			port: 3000,
			host: '0.0.0.0'
		})
	} catch (err) {
		console.error('Error starting server:', err)
		process.exit(1)
	}
}

start()
