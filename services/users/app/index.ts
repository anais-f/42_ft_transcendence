import './database/usersDatabase.js'
import Fastify from 'fastify'
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler
} from 'fastify-type-provider-zod'
import { usersRoutes } from './routes/usersRoutes.js'
import { UsersServices } from './usecases/usersServices.js'


import Swagger from '@fastify/swagger'
import SwaggerUI from '@fastify/swagger-ui'


const app = Fastify({
	logger: true
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)


// Enregistrer le plugin swagger pour générer la spec OpenAPI
await app.register(Swagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'API de mon microservice',
      description: 'Documentation générée automatiquement',
      version: '1.0.0',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Serveur local de développement' },
    ],
  },
})

// Enregistrer swagger-ui pour la doc interactive
await app.register(SwaggerUI, {
  routePrefix: '/docs', // accessible sur http://localhost:3000/docs
})

// Register routes
app.register(usersRoutes)

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
	} catch (err) {
		console.error('Error starting server: ', err)
		process.exit(1)
	}
}

start()
