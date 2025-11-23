import { Segment } from '../math/Segment'
import { Vector2 } from '../math/Vector2'
import { padDirection, PongPad } from './PongPad'

describe('', () => {
	test('move up', () => {
		const p1 = new Vector2(0, -1)
		const p2 = new Vector2(0, 1)
		const s = new Segment(p1, p2)

		const p3 = new Vector2(-5, 2)
		const p4 = new Vector2(5, 2)
		const p5 = new Vector2(-5, -2)
		const p6 = new Vector2(5, -2)
		const b1 = new Segment(p3, p4)
		const b2 = new Segment(p6, p5)

		const pad = new PongPad([s], [b1, b2])

		pad.move(padDirection.UP, 0.5)
		expect(p1.equals(new Vector2(0, -0.5))).toBe(true)
		expect(p2.equals(new Vector2(0, 1.5))).toBe(true)
		pad.move(padDirection.DOWN, 0.5)
		expect(p1.equals(new Vector2(0, -1))).toBe(true)
		expect(p2.equals(new Vector2(0, 1))).toBe(true)

		pad.move(padDirection.DOWN, 1.5)
		console.log(`${p1.getX()} : ${p1.getY()}`)
		console.log(`${p2.getX()} : ${p2.getY()}`)
		expect(p1.equals(new Vector2(0, -1))).toBe(true)
		expect(p2.equals(new Vector2(0, 1))).toBe(true)
	})
})
