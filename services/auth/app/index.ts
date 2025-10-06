import Fastify from 'fastify'
import { runMigrations } from './database/connection.js'
import { registerRoutes } from './routes/registerRoutes.js'
import { ENV } from './config/env.js'

const app = Fastify({ logger: true })

async function runServer() {
  runMigrations()
  await registerRoutes(app)
  await app.listen({ port: ENV.PORT, host: ENV.HOST })
  app.log.info(`Auth service running on http://${ENV.HOST}:${ENV.PORT}`)
}

runServer().catch(err => {
  app.log.error(err)
  process.exit(1)
})
