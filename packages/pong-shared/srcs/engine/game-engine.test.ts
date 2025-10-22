import { TPS_MANAGER } from './game-engine.js'

describe('TPS_MANAGER', () => {
	test('init', () => {
		const TPS = new TPS_MANAGER(20)
		expect(TPS.previousTime_MS).toBe(0)
		expect(TPS.TPS_INTERVAL_MS).toBe(50)
	})
})
