import Fastify, { FastifyInstance } from 'fastify'
import { initDB } from './database/connection.js'
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
import Swagger from '@fastify/swagger'
import { env } from './env/checkEnv.js'

export const app: FastifyInstance = Fastify({
	logger: { level: 'info' }
}).withTypeProvider<ZodTypeProvider>()

app.register(fastifyCookie)
app.register(fastifyJwt, {
	secret: env.JWT_SECRET,
	cookie: {
		cookieName: 'auth_token',
		signed: false
	}
})
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

initDB()

setupErrorHandler(app)
setupFastifyMonitoringHooks(app)

await app.register(metricPlugin.default, { endpoint: '/metrics' })

await registerRoutes(app)

app.register(Swagger as any, {
	openapi: {
		info: {
			title: 'API for 2FA Service',
			version: '1.0.0'
		},
		servers: [{ url: `${env.HOST}/2fa`, description: 'Local server' }],
		components: env.openAPISchema.components
	},
	transform: jsonSchemaTransform
})

const start = async () => {
	try {
		await app.listen({
			port: 3000,
			host: '0.0.0.0'
		})
		app.log.info(`2FA Service listening on http://localhost:3000`)
	} catch (err) {
		app.log.error(err)
		process.exit(1)
	}
}

start()
