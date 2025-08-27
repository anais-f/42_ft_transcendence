import { Vector2 } from '../Vector2'
import { Circle } from './Circle'
import { Polygon } from './Polygon'
import { AShape } from './AShape'
import { Rectangle } from './Rectangle'

describe('Shape', () => {
	describe('Shapes instanceof test', () => {
		test('Circle', () => {
			const c = new Circle(new Vector2(0, 0), 1)
			expect(c instanceof AShape).toBe(true)
		})
		test('Polygon', () => {
			const p = new Polygon([
				new Vector2(0, 0),
				new Vector2(1, 1),
				new Vector2(1, 0),
			])
			expect(p instanceof AShape).toBe(true)
		})
		test('Rect', () => {
			const rec = new Rectangle(new Vector2(0, 0), new Vector2(5, 7))
			expect(rec instanceof Polygon).toBe(true)
			expect(rec instanceof AShape).toBe(true)
		})
	})
})
