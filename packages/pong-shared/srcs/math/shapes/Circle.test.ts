import { Vector2 } from '../Vector2.js'
import { Circle } from './Circle.js'
import { Segment } from '../Segment.js'
import { Ray } from '../Ray.js'

describe('Circle', () => {
	test('create a circle', () => {
		const c = new Circle(new Vector2(5, 7), 5)
		expect(c.getPos()).toEqual(new Vector2(5, 7))
		expect(c.getRad()).toBeCloseTo(5)
	})

	test('circle setter', () => {
		const c = new Circle(new Vector2(), 1)
		c.setOrigin(new Vector2(5, 6))
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
			const res = circle.intersect(segmentInside)
			expect(res).toBeInstanceOf(Array)
		})

		test('intersect with segment touching circle', () => {
			const circle = new Circle(new Vector2(0, 0), 5)
			const segmentTouching = new Segment(new Vector2(0, 5), new Vector2(0, 10))
			const res = circle.intersect(segmentTouching)
			expect(res).toBeInstanceOf(Array)
			expect(res?.some((e) => e.hitPoint.equals(new Vector2(0, 5)))).toBe(true)
		})

		test('intersect with segment outside circle', () => {
			const circle = new Circle(new Vector2(0, 0), 5)
			const segmentOutside = new Segment(
				new Vector2(10, 10),
				new Vector2(15, 15)
			)
			const res = circle.intersect(segmentOutside)
			expect(res).not.toBeInstanceOf(Array)
		})

		test('intersect with segment partially inside', () => {
			const circle = new Circle(new Vector2(0, 0), 5)
			const segmentPartial = new Segment(
				new Vector2(-10, -10),
				new Vector2(2, 2)
			)
			const res = circle.intersect(segmentPartial)
			expect(res).toBeInstanceOf(Array)
			expect(res?.some((e) => e.hitPoint.equals(new Vector2(-3.53553, -3.53553)))).toBe(
				true
			)
		})

		test('intersect circle with other fully inside', () => {
			const v1 = new Vector2()
			const c1 = new Circle(v1, 10)
			const c2 = new Circle(v1, 15)
			const res = c1.intersect(c2)

			expect(res).toBeInstanceOf(Array)
			expect(res?.some((e) => isNaN(e.hitPoint.getX()) || isNaN(e.hitPoint.getY()))).toBe(false)
		})
		test('intersect circle with other fully inside 2', () => {
			const v1 = new Vector2(5, 7)
			const c1 = new Circle(v1, 10)
			const c2 = new Circle(v1, 15)
			const res = c1.intersect(c2)

			expect(res).toBeInstanceOf(Array)
			expect(res?.some((e) => isNaN(e.hitPoint.getX()) || isNaN(e.hitPoint.getY()))).toBe(false)
		})

		test('intersect circle with other fully inside 3', () => {
			const c1 = new Circle(new Vector2(5, 6), 100)
			const c2 = new Circle(new Vector2(18, 14), 15)
			const res = c1.intersect(c2)

			expect(res).toBeInstanceOf(Array)
			expect(res?.some((e) => isNaN(e.hitPoint.getX()) || isNaN(e.hitPoint.getY()))).toBe(false)
		})

		test('intersect circle with other inside', () => {
			const v1 = new Vector2()
			const v2 = new Vector2(2, 1)
			const c1 = new Circle(v1, 1)
			const c2 = new Circle(v2, 2)
			const res = c1.intersect(c2)

			expect(res).toBeInstanceOf(Array)

			expect(res).toHaveLength(2)

			expect(res?.some((e) => e.hitPoint.equals(new Vector2(0.8, -0.6)))).toBe(true)
			expect(res?.some((e) => e.hitPoint.equals(new Vector2(0, 1)))).toBe(true)
		})

		test('intersect circle with other inside (close)', () => {
			const v1 = new Vector2()
			const v2 = new Vector2(0, 1)
			const c1 = new Circle(v1, 1)
			const c2 = new Circle(v2, 1)
			const res = c1.intersect(c2)

			expect(res).toBeInstanceOf(Array)
			expect(res).toHaveLength(2)
			expect(res?.some((e) => e.hitPoint.equals(new Vector2(0.866025, 0.5)))).toBe(true)
			expect(res?.some((e) => e.hitPoint.equals(new Vector2(-0.866025, 0.5)))).toBe(true)
		})

		test('intersect circle with other outside', () => {
			const v1 = new Vector2()
			const v2 = new Vector2(2, 1)
			const c1 = new Circle(v1, 1)
			const c2 = new Circle(v2, 1)
			expect(c1.intersect(c2)).not.toBeInstanceOf(Array)
		})

		describe('intersect Ray', () => {
			test('intersect method should exist for Ray', () => {
				const c = new Circle(new Vector2(0, 0), 5)
				const r = new Ray(new Vector2(0, -10), new Vector2(0, 1))

				expect(() => {
					c.intersect(r)
				}).not.toThrow()
			})

			test('intersect with ray inside circle', () => {
				const circle = new Circle(new Vector2(0, 0), 5)
				const rayInside = new Ray(new Vector2(0, 0), new Vector2(1, 1))
				const res = circle.intersect(rayInside)
				expect(res).toBeInstanceOf(Array)
				expect(res).toHaveLength(1)
				expect(
					res?.some((e) => e.hitPoint.equals(new Vector2(3.5355339059, 3.5355339059)))
				).toBe(true)
			})

			test('intersect with ray touching circle', () => {
				const circle = new Circle(new Vector2(0, 0), 5)
				const ray = new Ray(new Vector2(0, 5), new Vector2(1, 0))
				const res = circle.intersect(ray)

				expect(res).toBeInstanceOf(Array)
				expect(res).toHaveLength(1)
				expect(res?.some((e) => e.hitPoint.equals(new Vector2(0, 5))))
			})

			test('intersect with ray outside circle', () => {
				const circle = new Circle(new Vector2(0, 0), 5)
				const ray = new Ray(new Vector2(10, 10), new Vector2(1, 1))
				const res = circle.intersect(ray)

				expect(res).toBe(null)
			})

			test('intersect with ray partially inside', () => {
				const circle = new Circle(new Vector2(0, 0), 5)
				const ray = new Ray(new Vector2(-10, -10), new Vector2(1, 1))
				const res = circle.intersect(ray)

				expect(
					res?.some((e) => e.hitPoint.equals(new Vector2(-3.5355339059, -3.5355339059)))
				)
				expect(
					res?.some((e) => e.hitPoint.equals(new Vector2(3.5355339059, 3.5355339059)))
				)
				expect(res).toBeInstanceOf(Array)
			})

			test('other intersect test', () => {
				const circle = new Circle(new Vector2(), 5)
				const ray = new Ray(new Vector2(-10.1, 10.1), new Vector2(1, -1))
				const res = circle.intersect(ray)

				expect(res).toBeInstanceOf(Array)
				expect(
					res?.some((e) => e.hitPoint.equals(new Vector2(3.5355339059, -3.5355339059)))
				)
				expect(
					res?.some((e) => e.hitPoint.equals(new Vector2(-3.5355339059, 3.5355339059)))
				)
			})

			test('outside but close', () => {
				const circle = new Circle(new Vector2(), 5)
				const r = new Ray(new Vector2(10, -10), new Vector2(-8, 18).normalize())
				const res = circle.intersect(r)

				expect(res).toBe(null)
			})

			test('intersect with ray starting inside circle', () => {
				const circle = new Circle(new Vector2(0.8, -1.4), 3.33)
				const ray = new Ray(
					new Vector2(-0.8, -1.6),
					new Vector2(0.894, 0.447).normalize()
				)
				const res = circle.intersect(ray)

				expect(res).toBeInstanceOf(Array)
				expect(res).toHaveLength(1)
				expect(res?.some((e) => e.hitPoint.equals(new Vector2(3.4995, 0.5497))))
			})

			test('intersect with ray starting at circle edge', () => {
				const circle = new Circle(new Vector2(0, 0), 5)
				const ray = new Ray(new Vector2(5, 0), new Vector2(1, 0))
				const res = circle.intersect(ray)

				expect(res).toBeInstanceOf(Array)
				expect(res).toHaveLength(1)
				expect(res?.some((e) => e.hitPoint.equals(new Vector2(0, 5))))
			})

			test('tangent', () => {
				const circle = new Circle(new Vector2(1, 0), 7)
				const ray = new Ray(new Vector2(-150, 7), new Vector2(1, 0))
				const res = circle.intersect(ray)

				expect(res).toBeInstanceOf(Array)
				expect(res).toHaveLength(1)
				expect(res?.some((e) => e.hitPoint.equals(new Vector2(1, 7))))
			})
		})
	})

	describe('containsPoint', () => {
		let circle: Circle

		beforeEach(() => {
			circle = new Circle(new Vector2(0, 0), 5)
		})

		test('point inside the circle', () => {
			const pointInside = new Vector2(3, 4)
			expect(circle.containsPoint(pointInside)).toBe(true)
		})

		test('point on the edge of the circle', () => {
			const pointOnEdge = new Vector2(5, 0)
			expect(circle.containsPoint(pointOnEdge)).toBe(true)
		})

		test('point outside the circle', () => {
			const pointOutside = new Vector2(6, 0)
			expect(circle.containsPoint(pointOutside)).toBe(false)
		})
	})
	describe('clone', () => {
		test('value', () => {
			const c1 = new Circle(new Vector2(), 5)
			const c2 = c1.clone()

			expect(c1).toEqual(c2)
		})

		test('deep copy', () => {
			const c1: Circle = new Circle(new Vector2(), 5)
			const c2 = c1.clone()

			c1.setRad(6)
			c1.setOrigin(new Vector2(-1, -1))

			expect(c1).not.toBe(c2)
			expect(c1.getPos()).not.toEqual(c2.getPos())
			expect(c1.getRad()).not.toEqual(c2.getRad())
			expect(c1.getPos()).toEqual(new Vector2(-1, -1))
			expect(c1.getRad()).toEqual(6)
		})
	})

	describe('getNormalAt', () => {
		test('normal at a point on the circle', () => {
			const circle = new Circle(new Vector2(0, 0), 5)
			const pointOnCircle = new Vector2(5, 0)
			const normal = circle.getNormalAt(pointOnCircle)
			expect(normal).toEqual(new Vector2(1, 0))
		})

		test('normal at a point on the circle (negative coordinates)', () => {
			const circle = new Circle(new Vector2(0, 0), 5)
			const pointOnCircle = new Vector2(-5, 0)
			const normal = circle.getNormalAt(pointOnCircle)
			expect(normal).toEqual(new Vector2(-1, 0))
		})

		test('normal at a point on the circle (non-axis aligned)', () => {
			const circle = new Circle(new Vector2(0, 0), 5)
			const pointOnCircle = new Vector2(3, 4)
			const normal = circle.getNormalAt(pointOnCircle)
			expect(normal).toEqual(new Vector2(0.6, 0.8))
		})
	})
})
