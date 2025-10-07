import { Vector2 } from '../Vector2'
import { Polygon } from './Polygon'
import { Circle } from './Circle'
import { Segment } from '../Segment'
import { Ray } from '../Ray'

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
			test('should return true when segment intersects polygon edge', () => {
				// Segment crossing one edge
				const segment1 = new Segment(new Vector2(-5, 5), new Vector2(5, 5))
				expect(square.intersect(segment1)).toBe(true)

				// Segment crossing two edges
				const segment2 = new Segment(new Vector2(-5, 5), new Vector2(15, 5))
				expect(square.intersect(segment2)).toBe(true)

				// Segment entirely inside
				const segment3 = new Segment(new Vector2(2, 2), new Vector2(8, 8))
				expect(square.intersect(segment3)).toBe(true)
			})

			test('should return false when segment does not intersect polygon', () => {
				// Segment completely outside
				const segment1 = new Segment(new Vector2(-5, -5), new Vector2(-2, -2))
				expect(square.intersect(segment1)).toBe(false)

				// Segment parallel to edge but outside
				const segment2 = new Segment(new Vector2(-5, -5), new Vector2(15, -5))
				expect(square.intersect(segment2)).toBe(false)
			})

			test('should handle edge cases', () => {
				// Segment touching at a vertex
				const segment1 = new Segment(new Vector2(-5, -5), new Vector2(0, 0))
				expect(square.intersect(segment1)).toBe(true)

				// Segment along an edge
				const segment2 = new Segment(new Vector2(0, 0), new Vector2(10, 0))
				expect(square.intersect(segment2)).toBe(true)
			})
		})

		describe('with Ray', () => {
			test('should return true when ray intersects polygon', () => {
				// Ray from outside pointing towards polygon
				const ray1 = new Ray(new Vector2(-5, 5), new Vector2(1, 0))
				expect(square.intersect(ray1)).toBe(true)

				// Ray from inside pointing outwards
				const ray2 = new Ray(new Vector2(5, 5), new Vector2(1, 0))
				expect(square.intersect(ray2)).toBe(true)
			})

			test('should return false when ray does not intersect polygon', () => {
				// Ray pointing away from polygon
				const ray1 = new Ray(new Vector2(-5, 5), new Vector2(-1, 0))
				expect(square.intersect(ray1)).toBe(false)

				// Ray parallel to edge but not intersecting
				const ray2 = new Ray(new Vector2(-5, -5), new Vector2(1, 0))
				expect(square.intersect(ray2)).toBe(false)
			})
		})

		describe('with Circle', () => {
			test('should return true when circle intersects polygon edge', () => {
				// Circle center outside, but intersecting an edge
				const circle1 = new Circle(new Vector2(-2, 5), 3)
				expect(square.intersect(circle1)).toBe(true)

				// Circle entirely inside polygon
				const circle2 = new Circle(new Vector2(5, 5), 2)
				expect(square.intersect(circle2)).toBe(true)

				// Circle center outside, partially overlapping
				const circle3 = new Circle(new Vector2(12, 5), 3)
				expect(square.intersect(circle3)).toBe(true)
			})

			test('should return false when circle does not intersect polygon', () => {
				// Circle completely outside
				const circle1 = new Circle(new Vector2(-5, -5), 2)
				expect(square.intersect(circle1)).toBe(false)
			})

			test('should handle edge cases', () => {
				// Circle touching at a vertex
				const circle1 = new Circle(new Vector2(-2, -2), 2 * Math.sqrt(2))
				expect(square.intersect(circle1)).toBe(true)

				// Circle touching at an edge
				const circle2 = new Circle(new Vector2(5, -3), 3)
				expect(square.intersect(circle2)).toBe(true)
			})
		})

		describe('with Polygon', () => {
			test('should return true when polygons overlap', () => {
				// Second polygon overlapping first polygon
				const polygon1 = new Polygon([
					new Vector2(5, 5),
					new Vector2(15, 5),
					new Vector2(15, 15),
					new Vector2(5, 15)
				])
				expect(square.intersect(polygon1)).toBe(true)
				expect(polygon1.intersect(square)).toBe(true)

				// Second polygon entirely inside first
				const polygon2 = new Polygon([
					new Vector2(2, 2),
					new Vector2(8, 2),
					new Vector2(8, 8),
					new Vector2(2, 8)
				])
				expect(square.intersect(polygon2)).toBe(true)
				expect(polygon2.intersect(square)).toBe(true)

				// First polygon entirely inside second
				const polygon3 = new Polygon([
					new Vector2(-5, -5),
					new Vector2(15, -5),
					new Vector2(15, 15),
					new Vector2(-5, 15)
				])
				expect(square.intersect(polygon3)).toBe(true)
				expect(polygon3.intersect(square)).toBe(true)
			})

			test('should return false when polygons do not overlap', () => {
				// Completely separate polygons
				const polygon1 = new Polygon([
					new Vector2(15, 15),
					new Vector2(20, 15),
					new Vector2(20, 20),
					new Vector2(15, 20)
				])
				expect(square.intersect(polygon1)).toBe(false)
				expect(polygon1.intersect(square)).toBe(false)

				// Adjacent polygons without overlap
				const polygon2 = new Polygon([
					new Vector2(10, 0),
					new Vector2(20, 0),
					new Vector2(20, 10),
					new Vector2(10, 10)
				])
				expect(square.intersect(polygon2)).toBe(true)
				expect(polygon2.intersect(square)).toBe(true)
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
				expect(square.intersect(concavePolygon)).toBe(true)
				expect(concavePolygon.intersect(square)).toBe(true)
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

				expect(poly1.intersect(poly2)).toBe(true)
				expect(poly2.intersect(poly1)).toBe(true)
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

				expect(poly1.intersect(poly2)).toBe(true)
				expect(poly2.intersect(poly1)).toBe(true)
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

				expect(poly1.intersect(poly2)).toBe(false)
				expect(poly2.intersect(poly1)).toBe(false)
			})
		})
	})
})
