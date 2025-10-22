import { PhysicsEngine } from './physics-engine.js'

describe('PhysicsEngine', () => {
	let P: PhysicsEngine
	beforeAll(() => {
		P = new PhysicsEngine()
	})

	test('playtick', () => {
		P.playTick()
		expect(P.tickCount).toBe(1)
	})
})
