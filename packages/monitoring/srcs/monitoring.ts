import { Counter, Gauge, Histogram, collectDefaultMetrics, register, Registry } from 'prom-client'
import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'

export function setupFastifyMonitoringHooks(app: FastifyInstance) {
	app.decorateRequest('startTime', null)

	app.addHook('onRequest', (request: FastifyRequest, reply: FastifyReply, done: () => void) => {
		request.startTime = process.hrtime()
		done()
	})

	app.addHook('onResponse', (request: FastifyRequest, reply: FastifyReply) => {
		httpRequestCounter.inc({
			method: request.method,
			route: request.url,
			status_code: reply.statusCode
		})
		const startTime = request.startTime
		if (startTime) {
			const diff = process.hrtime(startTime)
			const responseTimeInSeconds = diff[0] + diff[1] / 1e9
			responseTimeHistogram.observe(
				{
					method: request.method,
					route: request.url,
					status_code: reply.statusCode
				},
				responseTimeInSeconds
			)
		}
	})
}

const httpRequestCounter = new Counter({
	name: 'http_requests_total',
	help: 'Total number of HTTP requests',
	labelNames: ['method', 'route', 'status_code'] as const
})

const activeUsersGauge = new Gauge({
	name: 'active_users',
	help: 'Number of active users currently online'
})

const dbQueryDurationGauge = new Gauge({
	name: 'db_query_duration_seconds',
	help: 'Duration of database queries in seconds'
})

const responseTimeHistogram = new Histogram({
	name: 'http_response_time_seconds',
	help: 'Histogram of HTTP response times in seconds',
	labelNames: ['method', 'route', 'status_code'] as const,
	buckets: [0.001, 0.003, 0.005, 0.007, 0.01, 0.02, 0.05, 0.1, 0.5, 1]
})