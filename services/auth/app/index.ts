import Fastify from 'fastify'
import { runMigrations } from './database/connection.js'
import { registerRoutes } from './routes/registerRoutes.js'
import Swagger from '@fastify/swagger'
import SwaggerUI from '@fastify/swagger-ui'
import {serializerCompiler, validatorCompiler, ZodTypeProvider} from "fastify-type-provider-zod";

const app = Fastify({
  logger: true
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

async function runServer() {
	await runMigrations()
  await app.register(Swagger as any, {
    openapi: {
      info: {
        title: 'API for Users Service',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3001',
          description: 'Serveur local'
        }
      ]
    }
  })
  await app.register(SwaggerUI as any, {
    routePrefix: '/docs',
  })
	await registerRoutes(app)
	await app.listen({ port: 3001, host: '0.0.0.0' })
	app.log.info(`Auth service running on http://localhost:3000`)
}

runServer().catch((err) => {
	app.log.error(err)
	process.exit(1)
})

