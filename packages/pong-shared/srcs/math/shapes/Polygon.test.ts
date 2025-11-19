import { Vector2 } from '../Vector2.js'
import { Polygon } from './Polygon.js'
import { Circle } from './Circle.js'
import { Segment } from '../Segment.js'
import { Ray } from '../Ray.js'
import { IIntersect } from '../IIntersect.js'

describe('Polygon', () => {
	describe('getAbsolutePoints', () => {
		test('basic test', () => {
			const origin = new Vector2(5, 5)
			const relativePoints = [
				new Vector2(1, 1),
				new Vector2(2, 2),
				new Vector2(3, 3)
			]
			const poly = new Polygon(relativePoints, origin)

			const abs = poly.getAbsolutePoints()

			expect(abs).toEqual([
				new Vector2(6, 6), // 5 + 1, 5 + 1
				new Vector2(7, 7), // 5 + 2, 5 + 2
				new Vector2(8, 8) // 5 + 3, 5 + 3
			])
		})
		test('negative origin', () => {
			const origin = new Vector2(-10, -1)
			const poly = new Polygon(
				[new Vector2(0, 0), new Vector2(0, 1), new Vector2(1, 1)],
				origin
			)

			const abs = poly.getAbsolutePoints()
			expect(abs).toEqual([
				new Vector2(-10, -1),
				new Vector2(-10, 0),
				new Vector2(-9, 0)
			])
		})
	})

	describe('containsPoint function', () => {
		describe('with a square polygon', () => {
			let square: Polygon

			beforeEach(() => {
				square = new Polygon(
					[
						new Vector2(0, 0), // bottom left
						new Vector2(10, 0), // bottom right
						new Vector2(10, 10), // top right
						new Vector2(0, 10) // top left
					],
					new Vector2(1, 2)
				)
			})

			test('should return true for points inside the square', () => {
				expect(square.containsPoint(new Vector2(6, 7))).toBe(true)
				expect(square.containsPoint(new Vector2(2, 3))).toBe(true)
				expect(square.containsPoint(new Vector2(10, 11))).toBe(true)
			})

			test('should return false for points outside the square', () => {
				expect(square.containsPoint(new Vector2(-4, 7))).toBe(false)
				expect(square.containsPoint(new Vector2(16, 7))).toBe(false)
				expect(square.containsPoint(new Vector2(6, 17))).toBe(false)
				expect(square.containsPoint(new Vector2(6, -3))).toBe(false)
			})

			test('should handle edge cases on the boundary', () => {
				// Points on edges
				expect(square.containsPoint(new Vector2(1, 7))).toBe(true)
				expect(square.containsPoint(new Vector2(6, 2))).toBe(true)
				expect(square.containsPoint(new Vector2(11, 7))).toBe(true) // wtf
				expect(square.containsPoint(new Vector2(6, 12))).toBe(true)

				// Points on vertices
				expect(square.containsPoint(new Vector2(1, 2))).toBe(true)
				expect(square.containsPoint(new Vector2(11, 2))).toBe(true)
				expect(square.containsPoint(new Vector2(11, 12))).toBe(true)
				expect(square.containsPoint(new Vector2(1, 12))).toBe(true)
			})
		})

		// Test with a triangle
		describe('with a triangle polygon', () => {
			let triangle: Polygon

			beforeEach(() => {
				triangle = new Polygon([
					new Vector2(0, 0), // bottom left
					new Vector2(10, 0), // bottom right
					new Vector2(5, 10) // top
				])
			})

			test('should return true for points inside the triangle', () => {
				expect(triangle.containsPoint(new Vector2(5, 5))).toBe(true)
				expect(triangle.containsPoint(new Vector2(2, 2))).toBe(true)
				expect(triangle.containsPoint(new Vector2(8, 2))).toBe(true)
			})

			test('should return false for points outside the triangle', () => {
				expect(triangle.containsPoint(new Vector2(-5, 5))).toBe(false)
				expect(triangle.containsPoint(new Vector2(15, 5))).toBe(false)
				expect(triangle.containsPoint(new Vector2(5, 15))).toBe(false)
				expect(triangle.containsPoint(new Vector2(5, -5))).toBe(false)
			})
		})

		// Test with a concave polygon (L-shape)
		describe('with a concave L-shaped polygon', () => {
			let concavePolygon: Polygon

			beforeEach(() => {
				concavePolygon = new Polygon([
					new Vector2(0, 0), // bottom left
					new Vector2(10, 0), // bottom right
					new Vector2(10, 5), // middle right
					new Vector2(5, 5), // middle middle
					new Vector2(5, 10), // top middle
					new Vector2(0, 10) // top left
				])
			})

			test('should return true for points inside the concave polygon', () => {
				expect(concavePolygon.containsPoint(new Vector2(2, 2))).toBe(true)
				expect(concavePolygon.containsPoint(new Vector2(8, 2))).toBe(true)
				expect(concavePolygon.containsPoint(new Vector2(2, 8))).toBe(true)
			})

			test('should return false for points in the concave area', () => {
				expect(concavePolygon.containsPoint(new Vector2(8, 8))).toBe(false)
				expect(concavePolygon.containsPoint(new Vector2(7, 7))).toBe(false)
			})

			test('should return false for points outside the concave polygon', () => {
				expect(concavePolygon.containsPoint(new Vector2(-5, 5))).toBe(false)
				expect(concavePolygon.containsPoint(new Vector2(15, 5))).toBe(false)
				expect(concavePolygon.containsPoint(new Vector2(5, 15))).toBe(false)
				expect(concavePolygon.containsPoint(new Vector2(5, -5))).toBe(false)
			})
		})

		// Test with more complex cases
		describe('with edge cases', () => {
			test('should handle polygons with collinear points', () => {
				const polygon = new Polygon([
					new Vector2(0, 0),
					new Vector2(5, 0), // collinear with first and third
					new Vector2(10, 0),
					new Vector2(10, 10),
					new Vector2(0, 10)
				])

				expect(polygon.containsPoint(new Vector2(5, 5))).toBe(true)
				expect(polygon.containsPoint(new Vector2(15, 5))).toBe(false)
			})

			test('should handle thin polygons', () => {
				const thinPolygon = new Polygon([
					new Vector2(0, 0),
					new Vector2(10, 0),
					new Vector2(10, 0.1),
					new Vector2(0, 0.1)
				])

				expect(thinPolygon.containsPoint(new Vector2(5, 0.05))).toBe(true)
				expect(thinPolygon.containsPoint(new Vector2(5, 0.2))).toBe(false)
			})
		})

		describe('with relative position (origin)', () => {
			test('should work for a square polygon with origin (5, 10)', () => {
				const square = new Polygon(
					[
						new Vector2(0, 0),
						new Vector2(10, 0),
						new Vector2(10, 10),
						new Vector2(0, 10)
					],
					new Vector2(5, 10)
				)

				// Points inside (shifted by origin)
				expect(square.containsPoint(new Vector2(6, 11))).toBe(true)
				expect(square.containsPoint(new Vector2(10, 15))).toBe(true)
				expect(square.containsPoint(new Vector2(14, 19))).toBe(true)

				// Points outside
				expect(square.containsPoint(new Vector2(4, 11))).toBe(false)
				expect(square.containsPoint(new Vector2(15, 25))).toBe(false)
				expect(square.containsPoint(new Vector2(8, 9))).toBe(false)

				// Points on the border (should be true)
				expect(square.containsPoint(new Vector2(5, 15))).toBe(true)
				expect(square.containsPoint(new Vector2(15, 20))).toBe(true)
				expect(square.containsPoint(new Vector2(10, 10))).toBe(true)
				expect(square.containsPoint(new Vector2(5, 10))).toBe(true)
			})

			test('should work for triangle with origin (-3, 7)', () => {
				const triangle = new Polygon(
					[new Vector2(0, 0), new Vector2(10, 0), new Vector2(5, 10)],
					new Vector2(-3, 7)
				)

				// Inside
				expect(triangle.containsPoint(new Vector2(2, 10))).toBe(true)
				expect(triangle.containsPoint(new Vector2(4, 8))).toBe(true)
				expect(triangle.containsPoint(new Vector2(1, 7))).toBe(true)

				// Outside
				expect(triangle.containsPoint(new Vector2(-10, 20))).toBe(false)
				expect(triangle.containsPoint(new Vector2(13, 0))).toBe(false)
				expect(triangle.containsPoint(new Vector2(-3, 17))).toBe(false)

				// On border/vertex
				expect(triangle.containsPoint(new Vector2(-3, 7))).toBe(true)
				expect(triangle.containsPoint(new Vector2(7, 7))).toBe(true)
				expect(triangle.containsPoint(new Vector2(2, 17))).toBe(true)
			})

			test('should work for concave polygon with origin (-7, -3)', () => {
				const concavePolygon = new Polygon(
					[
						new Vector2(0, 0),
						new Vector2(10, 0),
						new Vector2(10, 5),
						new Vector2(5, 5),
						new Vector2(5, 10),
						new Vector2(0, 10)
					],
					new Vector2(-7, -3)
				)

				// Inside
				expect(concavePolygon.containsPoint(new Vector2(0, 0))).toBe(true)
				expect(concavePolygon.containsPoint(new Vector2(3, 1))).toBe(true)
				expect(concavePolygon.containsPoint(new Vector2(-2, 6))).toBe(true)
				expect(concavePolygon.containsPoint(new Vector2(-5, -2))).toBe(true)

				// Concave hole
				expect(concavePolygon.containsPoint(new Vector2(6, 7))).toBe(false)
				expect(concavePolygon.containsPoint(new Vector2(4, 4))).toBe(false)
				expect(concavePolygon.containsPoint(new Vector2(-1, 3))).toBe(false)

				// Outside
				expect(concavePolygon.containsPoint(new Vector2(-20, 0))).toBe(false)
				expect(concavePolygon.containsPoint(new Vector2(20, 20))).toBe(false)
			})
		})
	})
	describe('intersect', () => {
		let square: Polygon

		beforeEach(() => {
			square = new Polygon([
				new Vector2(0, 0), // bottom left
				new Vector2(10, 0), // bottom right
				new Vector2(10, 10), // top right
				new Vector2(0, 10) // top left
			])
		})

		describe('with Segment', () => {
			describe('polygon edge', () => {
				test('Segment crossing one edge', () => {
					const segment1 = new Segment(new Vector2(-5, 5), new Vector2(5, 5))
					const res = square.intersect(segment1)
					expect(res).toBeInstanceOf(Array)
					expect(res?.some((e) => e.hitPoint.equals(new Vector2(0, 1))))
					// alse have 5 5 ...
				})
				test('Segment crossing two edge', () => {
					const segment2 = new Segment(new Vector2(-5, 5), new Vector2(15, 5))
					const res = square.intersect(segment2)
					expect(res).toBeInstanceOf(Array)
					expect(res).toHaveLength(2)
					expect(res?.some((e) => e.hitPoint.equals(new Vector2(0, 5))))
					expect(res?.some((e) => e.hitPoint.equals(new Vector2(10, 5))))
				})
				test('Segment entirely inside', () => {
					const segment3 = new Segment(new Vector2(2, 2), new Vector2(8, 8))
					const res = square.intersect(segment3)
					expect(res).toBeInstanceOf(Array)
					expect(res).toHaveLength(2)
				})
			})
			describe('do not intersect', () => {
				test('completly outside', () => {
					const segment1 = new Segment(new Vector2(-5, -5), new Vector2(-2, -2))
					expect(square.intersect(segment1)).toBe(null)
				})
				test('parallel to edge but outside', () => {
					const segment2 = new Segment(new Vector2(-5, -5), new Vector2(15, -5))
					expect(square.intersect(segment2)).toBe(null)
				})
			})

			describe('edge case', () => {
				test('touching at a vertex', () => {
					const segment1 = new Segment(new Vector2(-5, -5), new Vector2(0, 0))
					const res = square.intersect(segment1)
					expect(res).toBeInstanceOf(Array)
					expect(res).toHaveLength(1)
					expect(res?.some((e) => e.hitPoint.equals(new Vector2())))
				})

				test('along an edge', () => {
					const segment2 = new Segment(new Vector2(0, 0), new Vector2(10, 0))
					const res = square.intersect(segment2)
					expect(res).toBeInstanceOf(Array)
					expect(res).toHaveLength(2)
					expect(res?.some((e) => e.hitPoint.equals(new Vector2())))
					expect(res?.some((e) => e.hitPoint.equals(new Vector2(10, 0))))
				})
			})

			describe('random tests', () => {
				test('test 1', () => {
					const seg = new Segment(new Vector2(1, 1), new Vector2(7, -3))
					const res = square.intersect(seg)

					expect(res).toBeInstanceOf(Array)
					expect(res).toHaveLength(2)
					expect(res?.some((e) => e.hitPoint.equals(new Vector2(2.5, 0))))
					expect(res?.some((e) => e.hitPoint.equals(new Vector2(1, 1))))
				})
				test('test 2', () => {
					const seg = new Segment(new Vector2(2, 14), new Vector2(7, -3))
					const res = square.intersect(seg)

					expect(res).toBeInstanceOf(Array)
					expect(res).toHaveLength(2)
					expect(res?.some((e) => e.hitPoint.equals(new Vector2(6.12, 0))))
					expect(res?.some((e) => e.hitPoint.equals(new Vector2(3.18, 10))))
				})
			})
		})

		describe('with Ray', () => {
			describe('hit cases', () => {
				test('ray outside pointing towards polygon', () => {
					const ray1 = new Ray(new Vector2(-5, 5), new Vector2(1, 0))
					const res = square.intersect(ray1)

					expect(res).toBeInstanceOf(Array)
					expect(res).toHaveLength(2)
					expect(res).toEqual([{hitPoint: new Vector2(0, 5)}, {hitPoint: new Vector2(10, 5)}])
				})

				test('Ray from inside pointing outward', () => {
					const ray2 = new Ray(new Vector2(5, 5), new Vector2(1, 0))
					const res = square.intersect(ray2)

					expect(res).toBeInstanceOf(Array)
					expect(res?.some((e) => e.hitPoint.equals(new Vector2(10, 5)))).toBe(true)
				})

				test('edge', () => {
					const ray = new Ray(new Vector2(10, -5), new Vector2(0, 1))
					const res = square.intersect(ray)

					expect(res).toBeInstanceOf(Array)
					expect(res).toHaveLength(2)
					expect(res).toEqual([{hitPoint: new Vector2(10, 0)}, {hitPoint: new Vector2(10, 10)}])
				})
			})

			describe('no hit cases', () => {
				test('Ray pointing away from polygo', () => {
					//
					const ray1 = new Ray(new Vector2(-5, 5), new Vector2(-1, 0))
					const res = square.intersect(ray1)

					expect(res).toBe(null)
				})
				test('Ray parallel to edge but not intersecting', () => {
					const ray2 = new Ray(new Vector2(-5, -5), new Vector2(1, 0))
					const res = square.intersect(ray2)

					expect(res).toBe(null)
				})
			})
		})

		describe('with Circle', () => {
			describe('polygon edge', () => {
				test('circle center outside, but intersecting an edge', () => {
					const circle = new Circle(new Vector2(-2, 5), 3)
					const res = square.intersect(circle)

					expect(res).toBeInstanceOf(Array)
					expect(res).toHaveLength(2)
					expect(res?.some((e) => e.hitPoint.equals(new Vector2(0, 7.23606)))).toBe(true)
					expect(res?.some((e) => e.hitPoint.equals(new Vector2(0, 2.76393)))).toBe(true)
				})
				test('circle entirely inside polygon', () => {
					const circle = new Circle(new Vector2(5, 5), 2)
					const res = square.intersect(circle)

					expect(res).toBeInstanceOf(Array)
					expect(res).toHaveLength(1)
					expect(res?.some((e) => e.hitPoint.equals(new Vector2(5, 5))))
				})
				test('circle center outside, partially overlapping', () => {
					const circle = new Circle(new Vector2(12, 5), 3)
					const res = square.intersect(circle)

					expect(res).toBeInstanceOf(Array)
					expect(res).toHaveLength(2)
					expect(res?.some((e) => e.hitPoint.equals(new Vector2(10, 7.23606)))).toBe(
						true
					)
					expect(res?.some((e) => e.hitPoint.equals(new Vector2(10, 2.76393)))).toBe(
						true
					)
				})
				test('touching at a vertex', () => {
					const circle = new Circle(new Vector2(-2, 0), 2)
					const res = square.intersect(circle)

					expect(res).toBeInstanceOf(Array)
					expect(res).toHaveLength(1)
					expect(res?.some((e) => e.hitPoint.equals(new Vector2())))
				})
				test('touching at en edge', () => {
					const circle = new Circle(new Vector2(5, -3), 3)
					const res = square.intersect(circle)

					expect(res).toBeInstanceOf(Array)
				})
			})
			test('circle does not intersect polygon', () => {
				const circle = new Circle(new Vector2(-5, -5), 2)
				const res = square.intersect(circle)

				expect(res).toBe(null)
			})
		})

		describe('with Polygon', () => {
			test('polygons overlap', () => {
				const polygon1 = new Polygon([
					new Vector2(5, 5),
					new Vector2(15, 5),
					new Vector2(15, 15),
					new Vector2(5, 15)
				])
				const res = square.intersect(polygon1)
				expect(res).toBeInstanceOf(Array)
			})

			test('second polygon entirely inside first', () => {
				const polygon2 = new Polygon([
					new Vector2(2, 2),
					new Vector2(8, 2),
					new Vector2(8, 8),
					new Vector2(2, 8)
				])
				const res = square.intersect(polygon2)

				expect(res).toBe(null)
			})

			test('First polygon entirely inside second', () => {
				const polygon3 = new Polygon([
					new Vector2(-5, -5),
					new Vector2(15, -5),
					new Vector2(15, 15),
					new Vector2(-5, 15)
				])
				const res = square.intersect(polygon3)

				// no polygon clipping
				//expect(res).toBeInstanceOf(Array)
				expect(res).toBe(null)
			})

			test('return false when polygons do not overlap', () => {
				// Completely separate polygons
				const polygon1 = new Polygon([
					new Vector2(15, 15),
					new Vector2(20, 15),
					new Vector2(20, 20),
					new Vector2(15, 20)
				])
				const res1 = square.intersect(polygon1)
				expect(res1).toBe(null)

				// Adjacent polygons without overlap
				const polygon2 = new Polygon([
					new Vector2(10, 0),
					new Vector2(20, 0),
					new Vector2(20, 10),
					new Vector2(10, 10)
				])
				const res2 = square.intersect(polygon2)
				expect(res2).toBeInstanceOf(Array)
				expect(res2?.some((e) => e.hitPoint.equals(new Vector2(10, 0))))
				expect(res2?.some((e) => e.hitPoint.equals(new Vector2(10, 10))))
			})

			test('none corner intersec', () => {
				const tri = new Polygon([
					new Vector2(8, 4),
					new Vector2(13, 0),
					new Vector2(13, 6)
				])
				const res = tri.intersect(square)

				expect(res).toBeInstanceOf(Array)
				expect(res).toHaveLength(2)
				expect(res?.some((e) => e.hitPoint.equals(new Vector2(10, 2.4))))
				expect(res?.some((e) => e.hitPoint.equals(new Vector2(10, 4.8))))
			})

			test('should handle concave polygons', () => {
				// L-shaped polygon intersecting with square
				const concavePolygon = new Polygon([
					new Vector2(5, 5), // inside square
					new Vector2(15, 5), // outside square
					new Vector2(15, 15), // outside square
					new Vector2(10, 15), // outside square
					new Vector2(10, 10), // on square edge
					new Vector2(5, 10) // inside square
				])
				const res = concavePolygon.intersect(square)
				expect(res).toBeInstanceOf(Array)
				expect(res?.some((e) => e.hitPoint.equals(new Vector2(10, 5))))
				expect(res?.some((e) => e.hitPoint.equals(new Vector2(10, 10))))
				expect(res?.some((e) => e.hitPoint.equals(new Vector2(5, 10))))
			})
		})
		describe('with relative position (origin)', () => {
			test('basic test', () => {
				const poly1 = new Polygon(
					[
						new Vector2(-1, -1),
						new Vector2(-1, 0),
						new Vector2(0, 1),
						new Vector2(1, 0)
					],
					new Vector2(-1, -1)
				)

				const poly2 = new Polygon(
					[
						new Vector2(0, 0),
						new Vector2(1, 0),
						new Vector2(1, 1),
						new Vector2(0, 1)
					],
					new Vector2(-1.5, -1.5)
				)

				const res = poly1.intersect(poly2)
				expect(res).toBeInstanceOf(Array)
			})
			test('should detect intersection for two polygons with different origins', () => {
				const poly1 = new Polygon(
					[
						new Vector2(0, 0),
						new Vector2(10, 0),
						new Vector2(10, 10),
						new Vector2(0, 10)
					],
					new Vector2(0, 0)
				)

				const poly2 = new Polygon(
					[
						new Vector2(0, 0),
						new Vector2(5, 0),
						new Vector2(5, 5),
						new Vector2(0, 5)
					],
					new Vector2(8, 8)
				) // poly2 moved to (8,8)-(13,13)

				const res = poly1.intersect(poly2)
				expect(res).toBeInstanceOf(Array)
			})

			test('should not detect intersection for separated polygons with origins', () => {
				const poly1 = new Polygon(
					[
						new Vector2(0, 0),
						new Vector2(3, 0),
						new Vector2(3, 3),
						new Vector2(0, 3)
					],
					new Vector2(0, 0)
				)

				const poly2 = new Polygon(
					[
						new Vector2(0, 0),
						new Vector2(2, 0),
						new Vector2(2, 2),
						new Vector2(0, 2)
					],
					new Vector2(10, 10)
				)

				const res = poly1.intersect(poly2)
				expect(res).toBe(null)
			})
		})
	})
	describe('clone', () => {
		test('value', () => {
			const p1 = new Polygon([
				new Vector2(),
				new Vector2(0, 1),
				new Vector2(1, 1),
				new Vector2(1, 0)
			])
			const p2 = p1.clone()

			expect(p1).toEqual(p2)
		})
		test('deep copy', () => {
			const p1 = new Polygon([
				new Vector2(),
				new Vector2(0, 1),
				new Vector2(1, 1),
				new Vector2(1, 0)
			])
			const p2 = p1.clone()
			p1.getSegment()[0].getP1().setX(6)

			expect(p1).not.toEqual(p2)

			p1.setOrigin(new Vector2(8, 9))

			expect(p2.getOrigin()).toEqual(new Vector2())
		})
	})

	describe('normal', () => {
		let polygon: Polygon

		beforeEach(() => {
			const vertices = [
				new Vector2(0, 0),
				new Vector2(5, 0),
				new Vector2(2.5, 5)
			]
			polygon = new Polygon(vertices)
		})

		test('normal at point below the base', () => {
			const point = new Vector2(2.5, -0.1)
			const normal = polygon.getNormalAt(point)
			expect(normal.getX()).toBeCloseTo(0)
			expect(normal.getY()).toBeCloseTo(-1)
		})

		test('normal at point near left edge', () => {
			const point = new Vector2(-0.1, 2.5)
			const normal = polygon.getNormalAt(point)
			const len = Math.sqrt(25 + 6.25)
			expect(normal.getX()).toBeCloseTo(-5 / len)
			expect(normal.getY()).toBeCloseTo(2.5 / len)
		})

		test('normal at point near right edge', () => {
			const point = new Vector2(5.1, 2.5)
			const normal = polygon.getNormalAt(point)
			const expected = new Vector2(1.08, 0.54).normalize()
			expect(normal.getX()).toBeCloseTo(expected.getX())
			expect(normal.getY()).toBeCloseTo(expected.getY())
		})

		test('normal at point on a vertex (base left)', () => {
			const point = new Vector2(0, 0)
			const normal = polygon.getNormalAt(point)
			expect(normal.getX()).toBeCloseTo(0)
			expect(normal.getY()).toBeCloseTo(-1)
		})
	})
})
