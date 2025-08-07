import { Vector2 } from "../Vector2"
import { Polygon } from "./Polygon" 
import { Circle } from "./Circle" 
import { Segment } from "../Segment"
import { Ray } from "../Ray"

describe("Polygon", () => {

  describe("containsPoint function", () => {
    describe("with a square polygon", () => {
      let square: Polygon

      beforeEach(() => {
        square = new Polygon([
          new Vector2(0, 0),  // bottom left
          new Vector2(10, 0), // bottom right
          new Vector2(10, 10), // top right
          new Vector2(0, 10)  // top left
        ])
      })

      test("should return true for points inside the square", () => {
        expect(square.containsPoint(new Vector2(5, 5))).toBe(true)
        expect(square.containsPoint(new Vector2(1, 1))).toBe(true)
        expect(square.containsPoint(new Vector2(9, 9))).toBe(true)
      })

      test("should return false for points outside the square", () => {
        expect(square.containsPoint(new Vector2(-5, 5))).toBe(false)
        expect(square.containsPoint(new Vector2(15, 5))).toBe(false)
        expect(square.containsPoint(new Vector2(5, 15))).toBe(false)
        expect(square.containsPoint(new Vector2(5, -5))).toBe(false)
      })

      test("should handle edge cases on the boundary", () => {
        // Points on edges
        expect(square.containsPoint(new Vector2(0, 5))).toBe(true)
        expect(square.containsPoint(new Vector2(5, 0))).toBe(true)
        expect(square.containsPoint(new Vector2(10, 5))).toBe(true) // wtf
        expect(square.containsPoint(new Vector2(5, 10))).toBe(true)

        // Points on vertices
        expect(square.containsPoint(new Vector2(0, 0))).toBe(true)
        expect(square.containsPoint(new Vector2(10, 0))).toBe(true)
        expect(square.containsPoint(new Vector2(10, 10))).toBe(true)
        expect(square.containsPoint(new Vector2(0, 10))).toBe(true)
      })
    })

    // Test with a triangle
    describe("with a triangle polygon", () => {
      let triangle: Polygon

      beforeEach(() => {
        triangle = new Polygon([
          new Vector2(0, 0),  // bottom left
          new Vector2(10, 0), // bottom right
          new Vector2(5, 10)  // top
        ])
      })

      test("should return true for points inside the triangle", () => {
        expect(triangle.containsPoint(new Vector2(5, 5))).toBe(true)
        expect(triangle.containsPoint(new Vector2(2, 2))).toBe(true)
        expect(triangle.containsPoint(new Vector2(8, 2))).toBe(true)
      })

      test("should return false for points outside the triangle", () => {
        expect(triangle.containsPoint(new Vector2(-5, 5))).toBe(false)
        expect(triangle.containsPoint(new Vector2(15, 5))).toBe(false)
        expect(triangle.containsPoint(new Vector2(5, 15))).toBe(false)
        expect(triangle.containsPoint(new Vector2(5, -5))).toBe(false)
      })
    })

    // Test with a concave polygon (L-shape)
    describe("with a concave L-shaped polygon", () => {
      let concavePolygon: Polygon

      beforeEach(() => {
        concavePolygon = new Polygon([
          new Vector2(0, 0),   // bottom left
          new Vector2(10, 0),  // bottom right
          new Vector2(10, 5),  // middle right
          new Vector2(5, 5),   // middle middle
          new Vector2(5, 10),  // top middle
          new Vector2(0, 10)   // top left
        ])
      })

      test("should return true for points inside the concave polygon", () => {
        expect(concavePolygon.containsPoint(new Vector2(2, 2))).toBe(true)
        expect(concavePolygon.containsPoint(new Vector2(8, 2))).toBe(true)
        expect(concavePolygon.containsPoint(new Vector2(2, 8))).toBe(true)
      })

      test("should return false for points in the concave area", () => {
        expect(concavePolygon.containsPoint(new Vector2(8, 8))).toBe(false)
        expect(concavePolygon.containsPoint(new Vector2(7, 7))).toBe(false)
      })

      test("should return false for points outside the concave polygon", () => {
        expect(concavePolygon.containsPoint(new Vector2(-5, 5))).toBe(false)
        expect(concavePolygon.containsPoint(new Vector2(15, 5))).toBe(false)
        expect(concavePolygon.containsPoint(new Vector2(5, 15))).toBe(false)
        expect(concavePolygon.containsPoint(new Vector2(5, -5))).toBe(false)
      })
    })

    // Test with more complex cases
    describe("with edge cases", () => {
      test("should handle polygons with collinear points", () => {
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

      test("should handle thin polygons", () => {
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
  })

  describe("intersect", () => {
    let square: Polygon

    beforeEach(() => {
      square = new Polygon([
        new Vector2(0, 0),  // bottom left
        new Vector2(10, 0), // bottom right
        new Vector2(10, 10), // top right
        new Vector2(0, 10)  // top left
      ])
    })

    describe("with Segment", () => {
      test("should return true when segment intersects polygon edge", () => {
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

      test("should return false when segment does not intersect polygon", () => {
        // Segment completely outside
        const segment1 = new Segment(new Vector2(-5, -5), new Vector2(-2, -2))
        expect(square.intersect(segment1)).toBe(false)

        // Segment parallel to edge but outside
        const segment2 = new Segment(new Vector2(-5, -5), new Vector2(15, -5))
        expect(square.intersect(segment2)).toBe(false)
      })

      test("should handle edge cases", () => {
        // Segment touching at a vertex
        const segment1 = new Segment(new Vector2(-5, -5), new Vector2(0, 0))
        expect(square.intersect(segment1)).toBe(true)

        // Segment along an edge
        const segment2 = new Segment(new Vector2(0, 0), new Vector2(10, 0))
        expect(square.intersect(segment2)).toBe(true)
      })
    })

    describe("with Ray", () => {
      test("should return true when ray intersects polygon", () => {
        // Ray from outside pointing towards polygon
        const ray1 = new Ray(new Vector2(-5, 5), new Vector2(1, 0))
        expect(square.intersect(ray1)).toBe(true)

        // Ray from inside pointing outwards
        const ray2 = new Ray(new Vector2(5, 5), new Vector2(1, 0))
        expect(square.intersect(ray2)).toBe(true)
      })

      test("should return false when ray does not intersect polygon", () => {
        // Ray pointing away from polygon
        const ray1 = new Ray(new Vector2(-5, 5), new Vector2(-1, 0))
        expect(square.intersect(ray1)).toBe(false)

        // Ray parallel to edge but not intersecting
        const ray2 = new Ray(new Vector2(-5, -5), new Vector2(1, 0))
        expect(square.intersect(ray2)).toBe(false)
      })
    })

    describe("with Circle", () => {
      test("should return true when circle intersects polygon edge", () => {
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

      test("should return false when circle does not intersect polygon", () => {
        // Circle completely outside
        const circle1 = new Circle(new Vector2(-5, -5), 2)
        expect(square.intersect(circle1)).toBe(false)
      })

      test("should handle edge cases", () => {
        // Circle touching at a vertex
        const circle1 = new Circle(new Vector2(-2, -2), 2 * Math.sqrt(2))
        expect(square.intersect(circle1)).toBe(true)

        // Circle touching at an edge
        const circle2 = new Circle(new Vector2(5, -3), 3)
        expect(square.intersect(circle2)).toBe(true)
      })
    })

    describe("with Polygon", () => {
      test("should return true when polygons overlap", () => {
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

      test("should return false when polygons do not overlap", () => {
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

      test("should handle concave polygons", () => {
        // L-shaped polygon intersecting with square
        const concavePolygon = new Polygon([
          new Vector2(5, 5),   // inside square
          new Vector2(15, 5),  // outside square
          new Vector2(15, 15), // outside square
          new Vector2(10, 15), // outside square
          new Vector2(10, 10), // on square edge
          new Vector2(5, 10)   // inside square
        ])
        expect(square.intersect(concavePolygon)).toBe(true)
        expect(concavePolygon.intersect(square)).toBe(true)
      })
    })
  })
})
