import { Vector2 } from "./Vector2"
import { Segment } from "./Segment"
import { Circle } from "./shapes/Circle"

describe("Segment", () => {
  test("getPoints returns endpoints", () => {
    const a = new Vector2(1, 2)
    const b = new Vector2(3, 4)
    const s = new Segment(a, b)
    expect(s.getPoints()).toEqual([a, b])
  })

  test("intersect with Circle - intersects", () => {
    const a = new Vector2(0, 0)
    const b = new Vector2(10, 0)
    const s = new Segment(a, b)
    const c = new Circle(new Vector2(5, 0), 2)
    expect(s.intersect(c)).toBe(true)
  })

  test("intersect with Circle - does not intersect", () => {
    const a = new Vector2(0, 0)
    const b = new Vector2(10, 0)
    const s = new Segment(a, b)
    const c = new Circle(new Vector2(5, 5), 2)
    expect(s.intersect(c)).toBe(false)
  })

  test("intersect with Circle - tangent", () => {
    const a = new Vector2(0, 0)
    const b = new Vector2(10, 0)
    const s = new Segment(a, b)
    const c = new Circle(new Vector2(5, 2), 2)
    expect(s.intersect(c)).toBe(true) // tangent
  })

  test("intersect throws on invalid type", () => {
    const a = new Vector2(0, 0)
    const b = new Vector2(1, 1)
    const s = new Segment(a, b)
    // @ts-ignore intentionally wrong type
    expect(() => s.intersect({})).toThrow()
  })
})
