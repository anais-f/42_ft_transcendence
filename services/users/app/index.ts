import './database/usersDatabase.js'
import Fastify from 'fastify'
import {
  ZodTypeProvider,
  validatorCompiler,
  serializerCompiler,
  jsonSchemaTransform
} from 'fastify-type-provider-zod'
import { usersRoutes } from './routes/usersRoutes.js'
import { UsersServices } from './usecases/usersServices.js'
import Swagger from '@fastify/swagger'
import SwaggerUI from '@fastify/swagger-ui'
import fs from 'fs'
import path from 'path'

const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Load OpenAPI schemas from common package
const openapiSwagger = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), '../../../packages/common/openapiDTO.json'), 'utf-8')
)

// Configure Swagger to use the loaded schemas
await app.register(Swagger as any, {
  openapi: {
    info: {
      title: 'API for Users Service',
      version: '1.0.0',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Serveur local' }],
    components: openapiSwagger.components
  },
  transform: jsonSchemaTransform
})

await app.register(SwaggerUI as any, {
  routePrefix: '/docs',
})

app.register(usersRoutes, { prefix: '/api' })

await app.ready()

// Export documentation to a file
// import { writeFileSync } from 'node:fs'
// const openapiDoc = app.swagger()
// writeFileSync('./openapi.json', JSON.stringify(openapiDoc, null, 2))
// console.log('Documentation OpenAPI écrite dans openapi.json')


const initializeUsers = async () => {
  console.log('Initializing users from auth service...')
  await UsersServices.syncAllUsersFromAuth()
  console.log('User initialization complete.')
}

const start = async () => {
  try {
    await initializeUsers()
    await app.listen({ port: 3000, host: '0.0.0.0' })
    console.log('Listening on port 3000')
    console.log('Swagger UI available at http://localhost:3000/docs')
  } catch (err) {
    console.error('Error starting server: ', err)
    process.exit(1)
  }
}

start()
