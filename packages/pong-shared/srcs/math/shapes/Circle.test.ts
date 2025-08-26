import { Vector2 } from '../Vector2'
import { Circle } from './Circle'
import { Segment } from '../Segment'
import { Ray } from '../Ray'

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

		describe('intersect Ray', () => {
			test('intersect method should exist for Ray', () => {
				const c = new Circle(new Vector2(0, 0), 5)
				const r = new Ray(new Vector2(0, -10), new Vector2(0, 1)) // Un rayon pointant vers le haut

				expect(() => {
					c.intersect(r)
				}).not.toThrow()
			})

			test('intersect with ray inside circle', () => {
				const circle = new Circle(new Vector2(0, 0), 5)
				const rayInside = new Ray(new Vector2(0, 0), new Vector2(1, 1)) // Un rayon partant du centre
				expect(circle.intersect(rayInside)).toBe(true)
			})

			test('intersect with ray touching circle', () => {
				const circle = new Circle(new Vector2(0, 0), 5)
				const rayTouching = new Ray(new Vector2(0, 5), new Vector2(1, 0)) // Un rayon tangent au cercle
				expect(circle.intersect(rayTouching)).toBe(true)
			})

			test('intersect with ray outside circle', () => {
				const circle = new Circle(new Vector2(0, 0), 5)
				const rayOutside = new Ray(new Vector2(10, 10), new Vector2(1, 1)) // Un rayon qui ne touche pas le cercle
				expect(circle.intersect(rayOutside)).toBe(false)
			})

			test('intersect with ray partially inside', () => {
				const circle = new Circle(new Vector2(0, 0), 5)
				const rayPartial = new Ray(new Vector2(-10, -10), new Vector2(1, 1)) // Un rayon qui entre dans le cercle
				expect(circle.intersect(rayPartial)).toBe(true)
			})

			test('other intersect test', () => {
				const circle = new Circle(new Vector2(), 5)
				const r = new Ray(new Vector2(10.1, -10.1), new Vector2(-1, 1))
				expect(circle.intersect(r)).toBe(true)
			})

			test('outside but close', () => {
				const circle = new Circle(new Vector2(), 5)
				const r = new Ray(new Vector2(10, -10), new Vector2(-4, 18).normalize())
				expect(circle.intersect(r)).toBe(false)
			})

			test('intersect with ray starting inside circle', () => {
				const circle = new Circle(new Vector2(0, 0), 5)
				const rayStartingInside = new Ray(new Vector2(1, 1), new Vector2(1, 1)) // Un rayon partant d'un point à l'intérieur
				expect(circle.intersect(rayStartingInside)).toBe(true)
			})

			test('intersect with ray starting at circle edge', () => {
				const circle = new Circle(new Vector2(0, 0), 5)
				const rayAtEdge = new Ray(new Vector2(5, 0), new Vector2(1, 0)) // Un rayon partant du bord du cercle
				expect(circle.intersect(rayAtEdge)).toBe(true)
			})
		})
	})
})
