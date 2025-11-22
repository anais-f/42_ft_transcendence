import { jest } from '@jest/globals'
import { GameEngine, GameState, TPS_MANAGER } from './game-engine.js'
import { Segment } from '../math/Segment.js'
import { Vector2 } from '../math/Vector2.js'
import { padDirection, PongPad } from './PongPad.js'
import { createScore, IScore } from './IScore.js'

describe('TPS_MANAGER', () => {
	test('init', () => {
		const TPS = new TPS_MANAGER(20)
		expect(TPS.previousTime_MS).toBe(0)
		expect(TPS.TPS_INTERVAL_MS).toBe(50)
	})
})

describe('game-engine', () => {
	let game: null | GameEngine = null
	const pointA = new Vector2(-20, -10)
	const pointB = new Vector2(20, -10)
	const pointC = new Vector2(20, 10)
	const pointD = new Vector2(-20, 10)
	const pointE = new Vector2(-18, -2)
	const pointF = new Vector2(-18, 2)
	const pointG = new Vector2(18, -2)
	const pointH = new Vector2(18, 2)

	const segA = new Segment(pointA, pointB)
	const segB = new Segment(pointD, pointC)
	const segC = new Segment(pointA, pointD)
	const segD = new Segment(pointB, pointC)

	let pad1: PongPad
	let pad2: PongPad
	let padSeg2: Segment
	let padSeg1: Segment
	const scoreData: IScore = createScore(5)
	beforeAll(() => {
		padSeg2 = new Segment(pointG.clone(), pointH.clone())
		padSeg1 = new Segment(pointE.clone(), pointF.clone())
		pad1 = new PongPad([padSeg1])
		pad2 = new PongPad([padSeg2])
		game = new GameEngine(
			60,
			scoreData,
			[segA, segB, segC, segD, padSeg1, padSeg2],
			[
				{ seg: segC, player: 1 },
				{ seg: segD, player: 2 }
			]
		)
	})

	test('init', () => {
		expect(game?.getTickCount()).toBe(0)
		expect(game?.getState()).toEqual(GameState.Paused)
	})

	test('loop', () => {
		const spyGameTicks = jest.spyOn(GameEngine.prototype as any, 'playTick')

		jest.useFakeTimers()
		game?.setState(GameState.Started)

		jest.advanceTimersByTime(100)

		game?.setState(GameState.Paused)
		jest.useRealTimers()

		expect(spyGameTicks).toHaveBeenCalled()
	})

	test('move pad', () => {
		const y1 = padSeg1.getP1().getY()
		const y2 = padSeg1.getP2().getY()
		pad1.move(padDirection.UP, 1)
		expect(padSeg1.getP1().getY()).toEqual(y1 + 1)
		expect(padSeg1.getP2().getY()).toEqual(y2 + 1)
		expect(padSeg1.getP1().getX()).toEqual(-18)
		pad1.move(padDirection.DOWN, 5.3)
		expect(padSeg1.getP1().getY()).toBeCloseTo(y1 - 4.3)
		expect(padSeg1.getP2().getY()).toBeCloseTo(y2 - 4.3)
		expect(padSeg1.getP1().getX()).toEqual(-18)
 		// reference test
		expect(
		// @ts-ignore
			game.borders.some(
				(e) =>
					e.getP1().equals(new Vector2(-18, y1 - 4.3)) &&
					e.getP2().equals(new Vector2(-18, y2 - 4.3))
			)
		).toBe(true)
	})
})
