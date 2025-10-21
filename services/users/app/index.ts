import './database/usersDatabase.js'
import Fastify from 'fastify'
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler
} from 'fastify-type-provider-zod'
import { usersRoutes } from './routes/usersRoutes.js'
import { UsersServices } from './usecases/usersServices.js'
import { ENV } from './config/env.js'

const app = Fastify({
	logger: false
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

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
		await app.listen({ port: ENV.PORT, host: '0.0.0.0' })
		console.log('Listening on port ', ENV.PORT)
	} catch (err) {
		console.error('Error starting server: ', err)
		process.exit(1)
	}
}

start()
