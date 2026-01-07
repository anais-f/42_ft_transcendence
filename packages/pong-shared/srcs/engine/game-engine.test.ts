import { jest } from '@jest/globals'
import { GameEngine, GameState } from './game-engine.js'
import { Segment } from '../math/Segment.js'
import { Vector2 } from '../math/Vector2.js'
import { padDirection, PongPad } from './PongPad.js'
import { createScore } from './IScore.js'

jest.mock('bottleneck', () => {
	return class MockBottleneck {
		schedule(task: any) {
			return Promise.resolve(task())
		}
	}
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
	let padSeg2: Segment
	let padSeg1: Segment
	const scoreData = createScore(5)
	beforeAll(() => {
		padSeg2 = new Segment(pointG.clone(), pointH.clone())
		padSeg1 = new Segment(pointE.clone(), pointF.clone())
		pad1 = new PongPad([padSeg1], null)
		game = new GameEngine(
			60,
			scoreData,
			[segA, segB, segC, segD],
			[padSeg1, padSeg2],
			[
				{ seg: segC, player: 1 },
				{ seg: segD, player: 2 }
			],
			5
		)
	})

	test('init', () => {
		expect(game?.tickCount).toBe(0)
		expect(game?.state).toEqual(GameState.Paused)
	})

	test('playTick is callable and updates tick count', () => {
		game?.setState(GameState.Started)
		const initialTickCount = game?.tickCount ?? 0

		game?.playTick()
		game?.playTick()
		game?.playTick()

		game?.setState(GameState.Paused)

		expect(game?.tickCount).toBeGreaterThan(initialTickCount)
	})

	test('move pad', () => {
		const y1 = padSeg1.p1.y
		const y2 = padSeg1.p2.y
		pad1.move(padDirection.UP, 1)
		expect(padSeg1.p1.y).toEqual(y1 + 1)
		expect(padSeg1.p2.y).toEqual(y2 + 1)
		expect(padSeg1.p1.x).toEqual(-18)
		pad1.move(padDirection.DOWN, 5.3)
		expect(padSeg1.p1.y).toBeCloseTo(y1 - 4.3)
		expect(padSeg1.p2.y).toBeCloseTo(y2 - 4.3)
		expect(padSeg1.p1.x).toEqual(-18)
		// reference test
		expect(
			// @ts-ignore
			game.borders.some(
				(e) =>
					e.p1.equals(new Vector2(-18, y1 - 4.3)) &&
					e.p2.equals(new Vector2(-18, y2 - 4.3))
			)
		).toBe(true)
	})
})
