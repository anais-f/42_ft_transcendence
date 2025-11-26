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

export const app: FastifyInstance = Fastify({
	logger: { level: 'info' }
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

runMigrations()

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
