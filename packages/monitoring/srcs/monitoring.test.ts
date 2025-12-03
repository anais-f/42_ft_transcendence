import { register } from 'prom-client'
import { setupFastifyMonitoringHooks } from './monitoring.js'

function createMockFastifyApp() {
	const hooks: Record<string, any[]> = {}
	const app = {
		hooks,
		decorateRequest: (name: string, defaultValue: any) => {
			// no-op for tests
		},
		addHook: (name: string, fn: any) => {
			if (!hooks[name]) hooks[name] = []
			hooks[name].push(fn)
		}
	}
	return app
}

describe('monitoring package', () => {
	beforeEach(() => {
		register.resetMetrics()
	})

	test('setupFastifyMonitoringHooks registers hooks and records metrics', async () => {
		const app = createMockFastifyApp()
		setupFastifyMonitoringHooks(app)

		const onRequest = app.hooks['onRequest'][0]
		const onResponse = app.hooks['onResponse'][0]

		const req: any = { method: 'GET', url: '/x' }
		const reply: any = { statusCode: 200 }

		await new Promise<void>((resolve) => {
			onRequest(req, reply, resolve)
		})

		await onResponse(req, reply)

		const metricsAll = await register.metrics()
		expect(metricsAll).toContain('http_requests_total')
		expect(metricsAll).toContain('http_response_time_seconds_bucket')
	})
})
