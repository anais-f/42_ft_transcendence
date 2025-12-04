//import { GameState } from '@ft_transcendence/pong-shared'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'
//import { createGame } from './utils/createGame.js'
import { createWsApp, loadOpenAPISchema } from '@ft_transcendence/common'
import { gameRoutes } from './routes/gameRoutes.js'

console.log('test: ', process.env.HOST as string)
const openapiSwager = loadOpenAPISchema(process.env.DTO_OPENAPI_FILE as string)
async function start(): Promise<void>
{
	const app = createWsApp(gameRoutes, {
		openapi: {
			info: {
				title: 'api for game',
				version: '1.0.0'
			},
			servers: [{ url: `${process.env.HOST as string}/pong-server`, description: 'idk' }],
			components: openapiSwager.components
		},
		transform: jsonSchemaTransform
	}, process.env.JWT_SECRET_GAME as string)
	
	try {
		await app.ready()
		await app.listen({
			port: parseInt(process.env.PORT as string),
			host: '0.0.0.0'
		})
		console.log('Listening on port', process.env.PORT)

	} catch (err) {
		console.error('Error starting server: ', err)
		process.exit(1)
	}
}

start()
