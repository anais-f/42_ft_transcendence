import { jsonSchemaTransform } from 'fastify-type-provider-zod'
import { createWsApp } from '@ft_transcendence/security'
import { registerRoutes } from './routes/registerRoutes.js'
import { checkEnv, IGameEnv } from './env/verifyEnv.js'
import { setupFastifyMonitoringHooks } from '@ft_transcendence/monitoring'
import { runMigrations } from './database/connection.js'
import { gameRoutes } from './routes/gameRoutes.js'
import { initializeTournamentId } from './usecases/tournamentUsecases.js'

// Run migrations first, then initialize tournament ID
runMigrations()
initializeTournamentId()

async function start(): Promise<void> {
	const env: IGameEnv = checkEnv() // throw on error
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
						url: env.HOST,
						description: 'idk'
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
