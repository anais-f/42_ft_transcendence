import { Ray } from './Ray.js'
import { Vector2 } from './Vector2.js'
import { Segment } from './Segment.js'
import { IIntersect } from './IIntersect.js'

describe('Ray', () => {
	test('constructor and getters', () => {
		const origin = new Vector2(0, 0)
		const direction = new Vector2(1, 0)
		const ray = new Ray(origin, direction)

		expect(ray.getOrigin()).toEqual(origin)
		expect(ray.getDirection()).toEqual(direction)
	})

	test('setters', () => {
		const ray = new Ray(new Vector2(0, 0), new Vector2(1, 0))

		const newOrigin = new Vector2(5, 5)
		const newDirection = new Vector2(0, 1)

		ray.setOrigin(newOrigin)
		ray.setDirection(newDirection)

		expect(ray.getOrigin()).toEqual(newOrigin)
		expect(ray.getDirection()).toEqual(newDirection)
	})

	test('RayFromPoints', () => {
		const p1 = new Vector2(0, 0)
		const p2 = new Vector2(3, 4)
		const ray = Ray.RayFromPoints(p1, p2)

		expect(ray.getOrigin()).toEqual(p1)

		const expectedDirection = new Vector2(3 / 5, 4 / 5)
		expect(ray.getDirection().getX()).toBeCloseTo(expectedDirection.getX())
		expect(ray.getDirection().getY()).toBeCloseTo(expectedDirection.getY())
	})

	describe('intersection tests', () => {
		describe('Ray Intersection', () => {
			test('should return true for intersecting rays', () => {
				const ray1 = new Ray(new Vector2(0, 0), new Vector2(1, 1).normalize())
				const ray2 = new Ray(new Vector2(1, 0), new Vector2(-1, 1).normalize())
				const res = ray1.intersect(ray2)

				expect(res).toBeInstanceOf(Array)
				expect(res).toHaveLength(1)
				// @ts-ignore
				expect(res[0].hitPoint.equals(new Vector2(0.5, 0.5))).toBe(true)
			})

			test('should return null for parallel rays', () => {
				const ray1 = new Ray(new Vector2(0, 0), new Vector2(1, 0).normalize())
				const ray2 = new Ray(new Vector2(0, 1), new Vector2(1, 0).normalize())
				const res = ray1.intersect(ray2)

				expect(res).not.toBeInstanceOf(Array)
			})

			test('should return null for rays pointing away from each other', () => {
				const ray1 = new Ray(new Vector2(0, 0), new Vector2(1, 0).normalize())
				const ray2 = new Ray(new Vector2(2, 0), new Vector2(-1, 0).normalize())
				const res = ray1.intersect(ray2)

				expect(res).not.toBeInstanceOf(Array)
			})

			test('should correctly handle rays at various angles', () => {
				const ray1 = new Ray(new Vector2(0, 0), new Vector2(1, 1).normalize())
				const ray2 = new Ray(new Vector2(1, 0), new Vector2(-1, 2).normalize())
				const res = ray1.intersect(ray2)
				const expected = 0.6666666666666666666667

				expect(res).toBeInstanceOf(Array)
				expect(res).toHaveLength(1)
				// @ts-ignore
				expect(res[0].hitPoint.equals(new Vector2(expected, expected))).toBe(true)
			})

			test('should handle near-parallel rays correctly', () => {
				const ray1 = new Ray(new Vector2(0, 0), new Vector2(1, 0).normalize())
				const ray2 = new Ray(
					new Vector2(0, 0),
					new Vector2(1, 0.0001).normalize()
				)

				const res = ray1.intersect(ray2)

				expect(res).toBeInstanceOf(Array)
				expect(res).toHaveLength(1)
				// @ts-ignore
				expect(res[0].hitPoint.equals(new Vector2())).toBe(true)
			})

			test('random test', () => {
				const r1 = new Ray(new Vector2(), new Vector2(2, 1).normalize())
				const r2 = new Ray(new Vector2(1, -1), new Vector2(7, 4).normalize())
				const res = r1.intersect(r2)

				expect(res).toBeInstanceOf(Array)
				expect(res).toHaveLength(1)
				// @ts-ignore
				expect(res[0].hitPoint.equals(new Vector2(22, 11))).toBe(true)
			})
		})

		describe('segment -> ray intersection', () => {
			test('ray intersecting segment', () => {
				const ray = new Ray(new Vector2(0, 0), new Vector2(1, 0))
				const segment = new Segment(new Vector2(2, -1), new Vector2(2, 1))
				const res = ray.intersect(segment)

				expect(res).toBeInstanceOf(Array)
				expect(res).toHaveLength(1)
				// @ts-ignore
				expect(res[0].hitPoint.equals(new Vector2(2, 0))).toBe(true)
			})

			test('ray directly intersecting segment', () => {
				const ray = new Ray(new Vector2(0, 0), new Vector2(1, 0))
				const segment = new Segment(new Vector2(2, 0), new Vector2(3, 0))
				const res = ray.intersect(segment)
				expect(res).toBeInstanceOf(Array)
				expect(res).toHaveLength(1)
				// @ts-ignore
				expect(res[0].hitPoint.equals(new Vector2(2, 0))).toBe(true)
			})

			test('ray parallel to segment', () => {
				const ray = new Ray(new Vector2(0, 0), new Vector2(1, 0))
				const segment = new Segment(new Vector2(0, 1), new Vector2(5, 1))

				expect(ray.intersect(segment)).not.toBeInstanceOf(Array)
			})

			test('ray intersecting segment at endpoint', () => {
				const ray = new Ray(new Vector2(0, 0), new Vector2(1, 0))
				const segment = new Segment(new Vector2(1, 0), new Vector2(2, 0))
				const res = ray.intersect(segment)

				expect(res).toBeInstanceOf(Array)
				expect(res).toHaveLength(1)
				// @ts-ignore
				expect(res[0].hitPoint.equals(new Vector2(1, 0))).toBe(true)
			})
		})

		test('invalid intersect type throws error', () => {
			const ray = new Ray(new Vector2(0, 0), new Vector2(1, 0))

			expect(() => {
				// @ts-ignore - intentionally passing wrong type
				ray.intersect(123)
			}).toThrow()
		})
	})
})
