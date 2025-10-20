import { Ray } from './Ray.js'
import { Vector2 } from './Vector2.js'
import { Segment } from './Segment.js'

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
			it('should return true for intersecting rays', () => {
				const ray1 = new Ray(new Vector2(0, 0), new Vector2(1, 1).normalize())
				const ray2 = new Ray(new Vector2(1, 0), new Vector2(-1, 1).normalize())

				expect(ray1.intersect(ray2)).toBe(true)
			})

			it('should return false for parallel rays', () => {
				const ray1 = new Ray(new Vector2(0, 0), new Vector2(1, 0).normalize())
				const ray2 = new Ray(new Vector2(0, 1), new Vector2(1, 0).normalize())

				expect(ray1.intersect(ray2)).toBe(false)
			})

			it('should return false for rays pointing away from each other', () => {
				const ray1 = new Ray(new Vector2(0, 0), new Vector2(1, 0).normalize())
				const ray2 = new Ray(new Vector2(2, 0), new Vector2(-1, 0).normalize())

				expect(ray1.intersect(ray2)).toBe(false)
			})

			it('should correctly handle rays at various angles', () => {
				const ray1 = new Ray(new Vector2(0, 0), new Vector2(1, 1).normalize())
				const ray2 = new Ray(new Vector2(1, 0), new Vector2(-1, 2).normalize())

				expect(ray1.intersect(ray2)).toBe(true)
			})

			it('should handle near-parallel rays correctly', () => {
				const ray1 = new Ray(new Vector2(0, 0), new Vector2(1, 0).normalize())
				const ray2 = new Ray(
					new Vector2(0, 0),
					new Vector2(1, 0.0001).normalize()
				)

				expect(ray1.intersect(ray2)).toBe(true)
			})
		})

		describe('segment -> ray intersection', () => {
			test('ray intersecting segment', () => {
				const ray = new Ray(new Vector2(0, 0), new Vector2(1, 0))
				const segment = new Segment(new Vector2(2, -1), new Vector2(2, 1))

				expect(ray.intersect(segment)).toBe(true)
			})

			test('ray directly intersecting segment', () => {
				const ray = new Ray(new Vector2(0, 0), new Vector2(1, 0))
				const segment = new Segment(new Vector2(2, 0), new Vector2(3, 0))

				expect(ray.intersect(segment)).toBe(true)
			})

			test('ray parallel to segment', () => {
				const ray = new Ray(new Vector2(0, 0), new Vector2(1, 0))
				const segment = new Segment(new Vector2(0, 1), new Vector2(5, 1))

				expect(ray.intersect(segment)).toBe(false)
			})

			test('ray intersecting segment at endpoint', () => {
				const ray = new Ray(new Vector2(0, 0), new Vector2(1, 0))
				const segment = new Segment(new Vector2(1, 0), new Vector2(2, 0))

				expect(ray.intersect(segment)).toBe(true)
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
