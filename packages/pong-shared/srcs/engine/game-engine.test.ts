import { jest } from '@jest/globals'
import { GameEngine, GameState, TPS_MANAGER } from './game-engine.js'
import { PhysicsEngine } from './physics-engine.js'

describe('TPS_MANAGER', () => {
	test('init', () => {
		const TPS = new TPS_MANAGER(20)
		expect(TPS.previousTime_MS).toBe(0)
		expect(TPS.TPS_INTERVAL_MS).toBe(50)
	})
})

describe('game-engine', () => {
	let game: null | GameEngine = null
	beforeAll(() => {
		game = new GameEngine(20)
	})

	test('init', () => {
		expect(game?.getTickCount()).toBe(0)
		expect(game?.packets.length).toBe(0)
		expect(game?.getState()).toEqual(GameState.Paused)
	})

	test('play tick', () => {
		const spyGameTicks = jest.spyOn(GameEngine.prototype as any, 'playTick')

		jest.useFakeTimers()
		game?.setState(GameState.Started)

		jest.advanceTimersByTime(100)

		game?.setState(GameState.Paused)
		jest.useRealTimers()

		expect(spyGameTicks).toHaveBeenCalled()
	})
})
