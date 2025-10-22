import { Vector2 } from '../Vector2'
import { Rectangle } from './Rectangle'

describe('Rectangle', () => {
	describe('init', () => {
		test('basic', () => {
			const r1 = new Rectangle(new Vector2(), new Vector2(50, 5))

			expect(r1.getOrigin()).toEqual(new Vector2())
			expect(r1.getWidth()).toEqual(50)
			expect(r1.getHeight()).toEqual(5)
			expect(r1.getSegment().length === 4).toBe(true)

			r1.setOrigin(new Vector2(-4, 5))
			expect(r1.getOrigin()).toEqual(new Vector2(-4, 5))
		})
	})
	describe('clone', () => {
		test('value', () => {
			const r1 = new Rectangle(new Vector2(), new Vector2(50, 5))
			const r2 = r1.clone()

			expect(r2).toEqual(r1)
		})

		test('deep copy', () => {
			const r1 = new Rectangle(new Vector2(), new Vector2(50, 5))
			const r2 = r1.clone()

			r1.setOrigin(new Vector2(5, 5))

			expect(r1.getOrigin()).not.toEqual(r2)
			expect(r2.getOrigin()).toEqual(new Vector2())
		})
	})
})
