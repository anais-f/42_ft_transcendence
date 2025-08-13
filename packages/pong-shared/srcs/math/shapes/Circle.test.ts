import { Vector2 } from '../Vector2'
import { Circle } from './Circle'
import { Segment } from '../Segment'

describe('Circle', () => {
	test('create a circle', () => {
		const c = new Circle(new Vector2(5, 7), 5)
		expect(c.getPos()).toEqual(new Vector2(5, 7))
		expect(c.getRad()).toBeCloseTo(5)
	})

	test('circle setter', () => {
		const c = new Circle(new Vector2(), 1)
		c.setPos(new Vector2(5, 6))
		c.setRad(5)
		expect(c.getPos()).toEqual(new Vector2(5, 6))
		expect(c.getRad()).toBe(5)
	})

	test('circle with zero radius', () => {
		expect(() => new Circle(new Vector2(0, 0), 0)).toThrow()
	})

	test('circle with negative radius should throw error', () => {
		expect(() => {
			new Circle(new Vector2(0, 0), -1)
		}).toThrow()
	})

	describe('intersect Circle', () => {
		test('intersect method should exist', () => {
			const c = new Circle(new Vector2(0, 0), 5)
			const s = new Segment(new Vector2(0, 0), new Vector2(10, 10))

			expect(() => {
				c.intersect(s)
			}).not.toThrow()
		})

		test('intersect method with invalid type should throw', () => {
			const c = new Circle(new Vector2(0, 0), 5)

			expect(() => {
				// @ts-ignore - intentionally passing wrong type to test error handling
				c.intersect(123)
			}).toThrow()
		})

		test('intersect with segment inside circle', () => {
			const circle = new Circle(new Vector2(0, 0), 5)
			const segmentInside = new Segment(new Vector2(-2, -2), new Vector2(2, 2))
			expect(circle.intersect(segmentInside)).toBe(true)
		})

		test('intersect with segment touching circle', () => {
			const circle = new Circle(new Vector2(0, 0), 5)
			const segmentTouching = new Segment(new Vector2(0, 5), new Vector2(0, 10))
			expect(circle.intersect(segmentTouching)).toBe(true)
		})

		test('intersect with segment outside circle', () => {
			const circle = new Circle(new Vector2(0, 0), 5)
			const segmentOutside = new Segment(
				new Vector2(10, 10),
				new Vector2(15, 15)
			)
			expect(circle.intersect(segmentOutside)).toBe(false)
		})

		test('intersect with segment partially inside', () => {
			const circle = new Circle(new Vector2(0, 0), 5)
			const segmentPartial = new Segment(
				new Vector2(-10, -10),
				new Vector2(2, 2)
			)
			expect(circle.intersect(segmentPartial)).toBe(true)
		})

		test('intersect circle with other fully inside', () => {
			const v1 = new Vector2()
			const c1 = new Circle(v1, 10)
			const c2 = new Circle(v1, 15)
			expect(c1.intersect(c2)).toBe(true)
		})

		test('intersect circle with other inside', () => {
			const v1 = new Vector2()
			const v2 = new Vector2(2, 1)
			const c1 = new Circle(v1, 1)
			const c2 = new Circle(v2, 2)
			expect(c1.intersect(c2)).toBe(true)
		})

		test('intersect circle with other inside (close)', () => {
			const v1 = new Vector2()
			const v2 = new Vector2(0, 1)
			const c1 = new Circle(v1, 1)
			const c2 = new Circle(v2, 1)
			expect(c1.intersect(c2)).toBe(true)
		})

		test('intersect circle with other outside', () => {
			const v1 = new Vector2()
			const v2 = new Vector2(2, 1)
			const c1 = new Circle(v1, 1)
			const c2 = new Circle(v2, 1)
			expect(c1.intersect(c2)).toBe(false)
		})
	})
})
