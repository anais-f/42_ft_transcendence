import { Vector2 } from './Vector2.js'
import { Segment } from './Segment.js'
import { Circle } from './shapes/Circle.js'
import { Ray } from './Ray.js'

describe('Segment', () => {
	test('getPoints returns endpoints', () => {
		const a = new Vector2(1, 2)
		const b = new Vector2(3, 4)
		const s = new Segment(a, b)
		expect(s.getPoints()).toEqual([a, b])
	})

	describe('intersect', () => {
		describe('circle', () => {
			test('basic intersect test', () => {
				const a = new Vector2(0, 0)
				const b = new Vector2(10, 0)
				const s = new Segment(a, b)
				const c = new Circle(new Vector2(5, 0), 2)
				expect(s.intersect(c)).toBe(true)
			})

			test('no intersect test', () => {
				const a = new Vector2(0, 0)
				const b = new Vector2(10, 0)
				const s = new Segment(a, b)
				const c = new Circle(new Vector2(5, 5), 2)
				expect(s.intersect(c)).toBe(false)
			})

			test('tangent', () => {
				const a = new Vector2(0, 0)
				const b = new Vector2(10, 0)
				const s = new Segment(a, b)
				const c = new Circle(new Vector2(5, 2), 2)
				expect(s.intersect(c)).toBe(true) // tangent
			})
		})

		describe('segment', () => {
			test('no intersect test', () => {
				const s2 = new Segment(new Vector2(10, -1), new Vector2(10, 1))
				const s1 = new Segment(new Vector2(-1, 0), new Vector2(1, 0))

				expect(s2.intersect(s1)).toBe(false)
			})

			test('90deg intersect', () => {
				const s2 = new Segment(new Vector2(0, -1), new Vector2(0, 1))
				const s1 = new Segment(new Vector2(-1, 0), new Vector2(1, 0))

				expect(s2.intersect(s1)).toBe(true)
			})

			test('point intersect', () => {
				const s1 = new Segment(new Vector2(), new Vector2(0, 1))
				const s2 = new Segment(new Vector2(), new Vector2(0, -1))

				expect(s1.intersect(s2)).toBe(true)
			})

			test('paralel no intersect', () => {
				const s1 = new Segment(new Vector2(0, 0), new Vector2(0, 1))
				const s2 = new Segment(new Vector2(1, 0), new Vector2(1, 1))

				expect(s1.intersect(s2)).toBe(false)
			})

			test('paralel intersect', () => {
				const s1 = new Segment(new Vector2(0, 0), new Vector2(0, 1))
				const s2 = new Segment(new Vector2(0, 0.5), new Vector2(0, 1.5))

				expect(s1.intersect(s2)).toBe(true)
			})

			test('self intersect', () => {
				const s1 = new Segment(new Vector2(0, 0), new Vector2(0, 1))

				expect(s1.intersect(s1)).toBe(true)
			})
		})

		describe('Ray', () => {
			let ray: Ray

			beforeEach(() => {
				ray = new Ray(new Vector2(-1, -1), new Vector2(1, 1).normalize())
			})

			test('perpendicular segment', () => {
				const s1 = new Segment(new Vector2(-1, 1), new Vector2(1, -1))
				const s2 = new Segment(new Vector2(-2, -1), new Vector2(-1, -2))

				expect(ray.intersect(s1)).toBe(true)
				expect(ray.intersect(s2)).toBe(false)
			})

			test('start intersection', () => {
				const s1 = new Segment(new Vector2(0, -2), new Vector2(-2, 0))

				expect(ray.intersect(s1)).toBe(true)
			})

			test('parallel collinear', () => {
				const s1 = new Segment(new Vector2(0, -2), new Vector2(2, 0))
				const s2 = new Segment(new Vector2(0, 0), new Vector2(1, 1))
				expect(ray.intersect(s1)).toBe(false)
				expect(ray.intersect(s2)).toBe(true)
			})
		})

		test('intersect throws on invalid type', () => {
			const a = new Vector2(0, 0)
			const b = new Vector2(1, 1)
			const s = new Segment(a, b)
			// @ts-ignore intentionally wrong type
			expect(() => s.intersect({})).toThrow()
		})
	})
})
