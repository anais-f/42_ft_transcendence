import { jest } from '@jest/globals'
import {
	httpRequestCounter,
	activeUsersGauge,
	dbQueryDurationGauge,
	responseTimeHistogram
} from './monitoring.js'
import { register } from 'prom-client'

describe('monitoring metrics', () => {
	beforeEach(() => {
		register.resetMetrics()
	})

	test('httpRequestCounter increments with labels', async () => {
		httpRequestCounter.inc({ method: 'GET', route: '/x', status_code: 200 })
		const metricsAll = await register.metrics()
		expect(metricsAll).toContain('http_requests_total')
	})

	test('activeUsersGauge set value', async () => {
		activeUsersGauge.set(5)
		const metricsAll = await register.metrics()
		expect(metricsAll).toContain('active_users')
		expect(metricsAll).toMatch(/active_users\s+5\b/) // value line matches 'active_users 5'
	})

	test('responseTimeHistogram observe bucket', async () => {
		responseTimeHistogram.observe(
			{ method: 'GET', route: '/z', status_code: 200 },
			0.01
		)
		const metricsAll = await register.metrics()
		expect(metricsAll).toContain('http_response_time_seconds_bucket')
	})
})
