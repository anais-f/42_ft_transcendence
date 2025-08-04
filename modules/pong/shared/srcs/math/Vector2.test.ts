import { Vector2 } from "./Vector2"

describe("Vector2", () => {

  test("create a vector with x and y coord", () => {
    const vec = new Vector2(4, 2)
    expect(vec.getX()).toBe(4)
    expect(vec.getY()).toBe(2)
  })

  test("create a vector with nefative x and y coord", () => {
    const vec = new Vector2(-4, -2)
    expect(vec.getX()).toBe(-4)
    expect(vec.getY()).toBe(-2)
  })

  test("subtract vector", () => {
    const v1 = new Vector2(10, -4)
    const v2 = new Vector2(11, 4.1)
    const expectVec = new Vector2(-1, -8.1) 
    expect(Vector2.subtract(v1, v2)).toEqual(expectVec)
    expect(v1.subtract(v2)).toEqual(expectVec)
  })

  test("add vector", () => {
    const v1 = new Vector2(2,-2)
    const v2 = new Vector2(-2,2)
    const expectVec = new Vector2()
    expect(Vector2.add(v1, v2)).toEqual(expectVec)
    expect(v1.add(v2)).toEqual(expectVec)
  })

  test("dot vector", () => {
    const v1 = new Vector2(7, 9)
    const v2 = new Vector2(5, -2)
    const expectDot = 7 * 5 + 9 * (-2) // 17
    expect(Vector2.dot(v1, v2)).toBe(expectDot)
  })

  test("cross product", () => {
    const v1 = new Vector2(3, 4)
    const v2 = new Vector2(5, 6)
    const expectedCross = 3 * 6 - 4 * 5 // 18 - 20 = -2
    expect(Vector2.cross(v1, v2)).toBe(expectedCross)
    expect(v1.cross(v2)).toBe(expectedCross)
  })

  test("magnitude and squaredLength", () => {
    const v = new Vector2(3, 4)
    expect(Vector2.magnitude(v)).toBe(5)
    expect(v.magnitude()).toBe(5)
    expect(v.squaredLength()).toBe(25)
  })

  test("normalize", () => {
    const v = new Vector2(0, 3)
    const normalized = Vector2.normalize(v)
    expect(normalized.getX()).toBeCloseTo(0)
    expect(normalized.getY()).toBeCloseTo(1)
    v.normalize()
    expect(v.getX()).toBeCloseTo(0)
    expect(v.getY()).toBeCloseTo(1)
  })

  test("normalize zero vector returns (0,0)", () => {
    const v = new Vector2(0, 0)
    const normalized = Vector2.normalize(v)
    expect(normalized.getX()).toBe(0)
    expect(normalized.getY()).toBe(0)
    v.normalize()
    expect(v.getX()).toBe(0)
    expect(v.getY()).toBe(0)
  })

  test("negate", () => {
    const v = new Vector2(3, -2)
    const negated = Vector2.negate(v)
    expect(negated.getX()).toBe(-3)
    expect(negated.getY()).toBe(2)
    v.negate()
    expect(v.getX()).toBe(-3)
    expect(v.getY()).toBe(2)
  })

  test("multiply by scalar", () => {
    const v = new Vector2(2, -5)
    const res = Vector2.multiply(v, 3)
    expect(res.getX()).toBe(6)
    expect(res.getY()).toBe(-15)
    v.multiply(-2)
    expect(v.getX()).toBe(-4)
    expect(v.getY()).toBe(10)
  })

  test("setters", () => {
    const v = new Vector2()
    v.setX(7)
    v.setY(-8)
    expect(v.getX()).toBe(7)
    expect(v.getY()).toBe(-8)
    v.setXY(1, 2)
    expect(v.getX()).toBe(1)
    expect(v.getY()).toBe(2)
  })
})
