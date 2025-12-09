//import { GameState } from '@ft_transcendence/pong-shared'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'
//import { createGame } from './utils/createGame.js'
import { createWsApp } from '@ft_transcendence/security'
import { gameRoutes } from './routes/gameRoutes.js'
import { checkEnv, IPongServerEnv } from './env/verifyEnv.js'

async function start(): Promise<void> {
	const env: IPongServerEnv = checkEnv() // throw on error
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
