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
import {
  UserPublicProfileSchema,
  SuccessResponseSchema,
  ErrorResponseSchema,
  PublicUserAuthSchema,
  PublicUserListAuthSchema,
} from '@ft_transcendence/common'

const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Charger le JSON OpenAPI généré depuis common
const openapiSwagger = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), '../../../packages/common/openapiDTO.json'), 'utf-8')
)

// Configure Swagger pour générer la doc OpenAPI
await app.register(Swagger as any, {
  openapi: {
    info: {
      title: 'API for Users Service',
      version: '1.0.0',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Serveur local' }],
    components: openapiSwagger.components  // Récupère les schemas du JSON
  },
  transform: jsonSchemaTransform  // IMPORTANT : convertit les schemas Zod en JSON Schema
})

// Enregistre Swagger UI sur /docs
await app.register(SwaggerUI as any, {
  routePrefix: '/docs',
})

// Enregistre tes routes
app.register(usersRoutes, { prefix: '/users' })

await app.ready()

// Exporte la documentation OpenAPI au format JSON
import { writeFileSync } from 'node:fs'
const openapiDoc = app.swagger()
writeFileSync('./openapi.json', JSON.stringify(openapiDoc, null, 2))
console.log('Documentation OpenAPI écrite dans openapi.json')

// Initialisation métiers et démarrage serveur
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
