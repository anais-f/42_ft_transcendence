import Fastify from 'fastify'
import { runMigrations } from './database/connection.js'
import { registerRoutes } from './routes/registerRoutes.js'
import Swagger from '@fastify/swagger'
import SwaggerUI from '@fastify/swagger-ui'
import fs from 'fs'
import path from 'path'

import {
  ZodTypeProvider,
  validatorCompiler,
  serializerCompiler,
  jsonSchemaTransform
} from 'fastify-type-provider-zod'

const app = Fastify({
  logger: true
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

async function runServer() {
	await runMigrations()

  // Load OpenAPI schemas from common package and configure Swagger
  const openapiSwagger = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), '../../../packages/common/openapiDTO.json'), 'utf-8')
  )
  await app.register(Swagger as any, {
    openapi: {
      info: {
        title: 'API for Auth Service',
        version: '1.0.0',
      },
      servers: [{ url: 'http://localhost:3001', description: 'Serveur local' }],
      components: openapiSwagger.components  // Récupère les schemas du JSON
    },
    transform: jsonSchemaTransform  // IMPORTANT : convertit les schemas Zod en JSON Schema
  })
  await app.register(SwaggerUI as any, {
    routePrefix: '/docs',
  })

	await registerRoutes(app)
	await app.listen({ port: 3001, host: '0.0.0.0' })
	app.log.info(`Auth service running on http://localhost:3001`)
}

runServer().catch((err) => {
	app.log.error(err)
	process.exit(1)
})
