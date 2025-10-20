import Fastify from 'fastify'
import { runMigrations } from './database/connection.js'
import { registerRoutes } from './routes/registerRoutes.js'

const app = Fastify({ logger: true })

async function runServer() {
	runMigrations()
	await registerRoutes(app)
	await app.listen({ port: 3000, host: '0.0.0.0' })
	app.log.info(`Auth service running on http://localhost:3000`)
}

runServer().catch((err) => {
	app.log.error(err)
	process.exit(1)
})
