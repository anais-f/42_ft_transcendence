import { jsonSchemaTransform } from 'fastify-type-provider-zod'
import { createWsApp } from '@ft_transcendence/security'
import { registerRoutes } from './routes/registerRoutes.js'
import { env } from './env/checkEnv.js'
import { setupFastifyMonitoringHooks } from '@ft_transcendence/monitoring'
import { runMigrations } from './database/connection.js'
import { gameRoutes } from './routes/gameRoutes.js'
import metricPlugin from 'fastify-metrics'

// Run migrations
runMigrations()

async function start(): Promise<void> {
	const app = createWsApp(
		gameRoutes,
		{
			openapi: {
				info: {
					title: 'api for game',
					version: '1.0.0'
				},
				servers: [
					{
						url: `http://localhost:3000/game`,
						description: 'Local server'
					}
				],
				components: env.openAPISchema.components
			},
			transform: jsonSchemaTransform
		},
		{
			main: env.JWT_SECRET,
			service: env.JWT_SECRET_GAME
		}
	)
	setupFastifyMonitoringHooks(app)
	await registerRoutes(app)

	try {
		await app.register(metricPlugin.default, { endpoint: '/metrics' })
		await app.ready()
		await app.listen({
			port: env.PORT,
			host: '0.0.0.0'
		})
		console.log(`listening on port: ${env.PORT}`)
	} catch (err) {
		console.error('Error starting server:', err)
		process.exit(1)
	}
}

start()
