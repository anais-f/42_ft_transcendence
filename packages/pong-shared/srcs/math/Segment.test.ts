import { Vector2 } from './Vector2'
import { Segment } from './Segment'
import { Circle } from './shapes/Circle'
import { Ray } from './Ray'

describe('Segment', () => {
	test('getPoints returns endpoints', () => {
		const a = new Vector2(1, 2)
		const b = new Vector2(3, 4)
		const s = new Segment(a, b)
		expect(s.getPoints()).toEqual([a, b])
	})
	describe('intersect', () => {
		// TODO: add more test later
		describe('circle', () => {
			test('basic intersect test', () => {
				const a = new Vector2(0, 0)
				const b = new Vector2(10, 0)
				const s = new Segment(a, b)
				const c = new Circle(new Vector2(5, 0), 2)
				const hps: Vector2[] | null = s.intersect(c)
				expect(Array.isArray(hps)).toBe(true)
				expect(hps?.length).toEqual(2)
				expect(hps).toContainEqual(new Vector2(7, 0))
				expect(hps).toContainEqual(new Vector2(3, 0))
			})

			test('no intersect test', () => {
				const a = new Vector2(0, 0)
				const b = new Vector2(10, 0)
				const s = new Segment(a, b)
				const c = new Circle(new Vector2(5, 5), 2)
				const hps: Vector2[] | null = s.intersect(c)
				expect(Array.isArray(hps)).toBe(false)
			})

			test('tangent', () => {
				const a = new Vector2(0, 0)
				const b = new Vector2(10, 0)
				const s = new Segment(a, b)
				const c = new Circle(new Vector2(5, 2), 2)
				const hps: Vector2[] | null = s.intersect(c)
				expect(Array.isArray(hps)).toBe(true) // tangent
				expect(hps?.length).toEqual(1)
				expect(hps).toContainEqual(new Vector2(5, 0))
			})
		})

		describe('segment', () => {
			test('no intersect test', () => {
				const s2 = new Segment(new Vector2(10, -1), new Vector2(10, 1))
				const s1 = new Segment(new Vector2(-1, 0), new Vector2(1, 0))

				expect(Array.isArray(s2.intersect(s1))).toBe(false)
			})

			test('90deg intersect', () => {
				const s2 = new Segment(new Vector2(0, -1), new Vector2(0, 1))
				const s1 = new Segment(new Vector2(-1, 0), new Vector2(1, 0))
				const res = s1.intersect(s2)

				expect(Array.isArray(res)).toBe(true)
				expect(res?.length).toEqual(1)
				expect(res).toContainEqual(new Vector2(0, 0))
			})
			test('point intersect', () => {
				const s1 = new Segment(new Vector2(), new Vector2(0, 1))
				const s2 = new Segment(new Vector2(), new Vector2(0, -1))
				const res = s1.intersect(s2)

				expect(Array.isArray(res)).toBe(true)
				expect(res?.length).toEqual(1)
				expect(res).toContainEqual(new Vector2(0, 0))
			})

			test('paralel no intersect', () => {
				const s1 = new Segment(new Vector2(0, 0), new Vector2(0, 1))
				const s2 = new Segment(new Vector2(1, 0), new Vector2(1, 1))

				expect(Array.isArray(s1.intersect(s2))).toBe(false)
			})

			test('paralel intersect', () => {
				const s1 = new Segment(new Vector2(0, 0), new Vector2(0, 1))
				const s2 = new Segment(new Vector2(0, 0.5), new Vector2(0, 1.5))
				const res = s1.intersect(s2)

				expect(Array.isArray(res)).toBe(true)
				expect(res).toContainEqual(new Vector2(0, 0.5))
			})

			test('self intersect', () => {
				const s1 = new Segment(new Vector2(0, 0), new Vector2(0, 1))
				const res = s1.intersect(s1)
				expect(Array.isArray(res)).toBe(true)
			})

			test('random test intersect', () => {
				const a = new Vector2(-1.12, -1.36)
				const b = new Vector2(4.02, 2.26)
				const c = new Vector2(-1.22, 3.32)
				const d = new Vector2(5.56, -1.04)
				const s1 = new Segment(a, b)
				const s2 = new Segment(c, d)

				const res = s1.intersect(s2)

				expect(Array.isArray(res)).toBe(true)
				expect(res).toBeInstanceOf(Array)
				// @ts-ignore
				expect(res[0].equals(new Vector2(2.30576, 1.05269))).toBe(true)
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

				expect(ray.intersect(s1)).toBeInstanceOf(Array)
				// @ts-ignore
				expect(ray.intersect(s1)[0].equals(new Vector2())).toBe(true)
				expect(ray.intersect(s2)).toBe(null)
			})

			// TODO
			test('start intersection', () => {
				const s1 = new Segment(new Vector2(0, -2), new Vector2(-2, 0))
				const result = ray.intersect(s1)
				const expected = new Vector2(-1, -1)

				expect(result).toBeInstanceOf(Array)
				expect(result).toHaveLength(1)
				// @ts-ignore
				expect(result[0].equals(expected)).toBe(true)
			})
			// TODO
			test('parallel collinear', () => {
				const s1 = new Segment(new Vector2(0, -2), new Vector2(2, 0))
				const s2 = new Segment(new Vector2(0, 0), new Vector2(1, 1))
				expect(ray.intersect(s1)).toBe(null)
				expect(ray.intersect(s2)).toBeInstanceOf(Array)
			})

			test('random test intersect', () => {
				const s = new Segment(
					new Vector2(-1.2692, -1.67395),
					new Vector2(0.78382, 1.52463)
				)
				const res: Vector2[] | null = ray.intersect(s)

				expect(res).toBeInstanceOf(Array)
				expect(res).toHaveLength(1)
				// @ts-ignore
				expect(res[0].equals(new Vector2(-0.54383, -0.54383))).toBe(true)
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

	describe('distanceToPoint', () => {
		test('distance to point on segment', () => {
			const s = new Segment(new Vector2(0, 0), new Vector2(4, 4))
			const point = new Vector2(2, 2)
			expect(s.distanceToPoint(point)).toBe(0)
		})
		test('distance to point on segment 2', () => {
			const s = new Segment(new Vector2(0, 0), new Vector2(4, 4))
			const point = new Vector2(1, 1)
			expect(s.distanceToPoint(point)).toBe(0)
		})

		test('distance to point on segment 3', () => {
			const s = new Segment(new Vector2(-3.36, 2.82), new Vector2(3.1, -3.4))
			const point = new Vector2(-2.26, 1.76)
			const p2 = new Vector2(-1.8, 1.16)
			expect(s.distanceToPoint(point)).toBeCloseTo(0)
			expect(s.distanceToPoint(p2)).not.toBeCloseTo(0)
			expect(s.distanceToPoint(p2)).toBeCloseTo(0.113)
		})

		test('distance to point off segment', () => {
			const s = new Segment(new Vector2(0, 0), new Vector2(4, 4))
			const point = new Vector2(0, 4)
			expect(s.distanceToPoint(point)).toBeCloseTo(Math.sqrt(8))
		})

		test('distance to endpoint', () => {
			const s = new Segment(new Vector2(0, 0), new Vector2(4, 4))
			const point = new Vector2(0, 0)
			expect(s.distanceToPoint(point)).toBe(0)
		})
	})

	describe('closestPointToPoint', () => {
		test('closest point on segment', () => {
			const s = new Segment(new Vector2(0, 0), new Vector2(4, 4))
			const point = new Vector2(2, 3)
			const closestPoint = s.closestPointToPoint(point)
			expect(closestPoint).toEqual(new Vector2(2.5, 2.5))
		})

		test('closest point at endpoint', () => {
			const s = new Segment(new Vector2(0, 0), new Vector2(4, 4))
			const point = new Vector2(5, 5)
			const closestPoint = s.closestPointToPoint(point)
			expect(closestPoint).toEqual(new Vector2(4, 4))
		})

		test('closest point when point is before segment', () => {
			const s = new Segment(new Vector2(1, 1), new Vector2(3, 3))
			const point = new Vector2(0, 0)
			const closestPoint = s.closestPointToPoint(point)
			expect(closestPoint).toEqual(new Vector2(1, 1))
		})

		test('closest point when point is after segment', () => {
			const s = new Segment(new Vector2(1, 1), new Vector2(3, 3))
			const point = new Vector2(4, 4)
			const closestPoint = s.closestPointToPoint(point)
			expect(closestPoint).toEqual(new Vector2(3, 3))
		})
	})

	describe('contain', () => {
		test('point on segment', () => {
			const s = new Segment(new Vector2(0, 0), new Vector2(4, 4))
			const point = new Vector2(2, 2)
			expect(s.contain(point)).toBe(true)
		})

		test('point not on segment', () => {
			const s = new Segment(new Vector2(0, 0), new Vector2(4, 4))
			const point = new Vector2(5, 5)
			expect(s.contain(point)).toBe(false)
		})

		test('point at endpoint', () => {
			const s = new Segment(new Vector2(0, 0), new Vector2(4, 4))
			const point = new Vector2(0, 0)
			expect(s.contain(point)).toBe(true)
		})
	})

	describe('normal', () => {
		test('horizontal one', () => {
			const seg = new Segment(new Vector2(0, 0), new Vector2(10, 0))
			const normal = seg.getNormal()

			expect(Math.abs(normal.getX())).toBe(0)
			expect(Math.abs(normal.getY())).toBe(1)
		})

		test('vertical one', () => {
			const seg = new Segment(new Vector2(0, 0), new Vector2(0, 10))
			const normal = seg.getNormal()

			expect(Math.abs(normal.getX())).toBe(1)
			expect(Math.abs(normal.getY())).toBe(0)
		})

		test('45 deg test', () => {
			const seg = new Segment(new Vector2(0, 0), new Vector2(1, 1))
			const normal = seg.getNormal()

			const expectedX = Math.abs(1 / Math.sqrt(2))
			const expectedY = Math.abs(-1 / Math.sqrt(2))
			expect(Math.abs(normal.getX())).toBeCloseTo(expectedX)
			expect(Math.abs(normal.getY())).toBeCloseTo(expectedY)
		})
	})
})
