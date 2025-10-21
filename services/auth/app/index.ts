import Fastify from 'fastify'
import { runMigrations } from './database/connection.js'
import { registerRoutes } from './routes/registerRoutes.js'
import Swagger from '@fastify/swagger'
import SwaggerUI from '@fastify/swagger-ui'
import fs from 'fs'
import {
  ZodTypeProvider,
  validatorCompiler,
  serializerCompiler,
  jsonSchemaTransform
} from 'fastify-type-provider-zod'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const app = Fastify({
  logger: true
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

async function runServer() {
	await runMigrations()

// resolve path relative to the compiled file in dist/
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const openapiPath = join(__dirname, 'openapiDTO.json')
  const openapiText = fs.readFileSync(openapiPath, 'utf8')
  const openapiDTO = JSON.parse(openapiText)
  await app.register(Swagger as any, {
    openapi: {
      info: {
        title: 'API for Auth Service',
        version: '1.0.0',
      },
      servers: [{ url: 'http://localhost:8080' }],
      components: openapiDTO.components
    },
    transform: jsonSchemaTransform
  })
  await app.register(SwaggerUI as any, {
    routePrefix: '/docs',
  })

	await registerRoutes(app)
	await app.listen({ port: 3000, host: '0.0.0.0' })
	app.log.info(`Auth service running on http://localhost:3001`)
}

runServer().catch((err) => {
	app.log.error(err)
	process.exit(1)
})
