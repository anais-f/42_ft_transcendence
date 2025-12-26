import { Counter, Gauge, Histogram, collectDefaultMetrics } from 'prom-client'
import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'

export function setupFastifyMonitoringHooks(app: FastifyInstance) {
	app.decorateRequest('startTime', null)

	app.addHook(
		'onRequest',
		(request: FastifyRequest, reply: FastifyReply, done: () => void) => {
			request.startTime = process.hrtime()
			done()
		}
	)

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

export const httpRequestCounter = new Counter({
	name: 'http_requests_total',
	help: 'Total number of HTTP requests',
	labelNames: ['method', 'route', 'status_code'] as const
})

export const activeUsersGauge = new Gauge({
	name: 'active_users',
	help: 'Number of active users currently online'
})

export const connectedUsersGauge = new Gauge({
	name: 'websocket_connected_users',
	help: 'Number of users currently connected via WebSocket'
})

export const activeGamesGauge = new Gauge({
	name: 'active_games',
	help: 'Number of active games',
	labelNames: ['status'] as const
})

export const activeTournamentsGauge = new Gauge({
	name: 'active_tournaments',
	help: 'Number of tournaments',
	labelNames: ['status'] as const
})

export const playersInTournamentsGauge = new Gauge({
	name: 'players_in_tournaments',
	help: 'Number of players currently in tournaments'
})

export const totalRegisteredUsersGauge = new Gauge({
	name: 'total_registered_users',
	help: 'Total number of registered users in the database'
})

export const dbQueryDurationGauge = new Gauge({
	name: 'db_query_duration_seconds',
	help: 'Duration of database queries in seconds'
})

export const responseTimeHistogram = new Histogram({
	name: 'http_response_time_seconds',
	help: 'Histogram of HTTP response times in seconds',
	labelNames: ['method', 'route', 'status_code'] as const,
	buckets: [0.001, 0.003, 0.005, 0.007, 0.01, 0.02, 0.05, 0.1, 0.5, 1]
})
