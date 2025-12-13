import Fastify, { FastifyInstance } from 'fastify'
import { runMigrations } from './database/connection.js'
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler,
	jsonSchemaTransform
} from 'fastify-type-provider-zod'
import { registerRoutes } from './routes/2faRoutes.js'
import metricPlugin from 'fastify-metrics'
import { setupFastifyMonitoringHooks } from '@ft_transcendence/monitoring'
import fastifyCookie from '@fastify/cookie'
import fastifyJwt from '@fastify/jwt'
import { setupErrorHandler } from '@ft_transcendence/common'

export const app: FastifyInstance = Fastify({
	logger: { level: 'info' }
}).withTypeProvider<ZodTypeProvider>()

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) {
	throw new Error('JWT_SECRET environment variable is required')
}

app.register(fastifyCookie)
app.register(fastifyJwt, {
	secret: jwtSecret,
	cookie: {
		cookieName: 'auth_token',
		signed: false
	}
})
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

runMigrations()

setupErrorHandler(app)
setupFastifyMonitoringHooks(app)

await app.register(metricPlugin.default, { endpoint: '/metrics' })

await registerRoutes(app)

const start = async () => {
	try {
		await app.listen({
			port: parseInt(process.env.PORT as string),
			host: '0.0.0.0'
		})
		app.log.info(
			`2FA Service listening on http://localhost:${process.env.PORT}`
		)
	} catch (err) {
		app.log.error(err)
		process.exit(1)
	}
}

if (process.env.NODE_ENV !== 'test') {
	start()
}
