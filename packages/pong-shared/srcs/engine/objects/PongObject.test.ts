import { Circle } from '../../math/shapes/Circle'
import { Polygon } from '../../math/shapes/Polygon'
import { Rectangle } from '../../math/shapes/Rectangle'
import { Vector2 } from '../../math/Vector2'
import { PongObject } from './PongObject'

describe('PongObject', () => {
	describe('init test', () => {
		test('shape init', () => {
			const obj = new PongObject(
				new Polygon(
					[new Vector2(), new Vector2(10, 0), new Vector2(5, 5)],
					new Vector2(0, 0)
				),
				new Vector2(5, 5)
			)
			expect(obj.getHitbox().length === 1).toBe(true)
			expect(obj.getOrigin()).toEqual(new Vector2(5, 5))
		})

		test('array init', () => {
			const shapeArray = [
				new Circle(new Vector2(), 5),
				new Rectangle(new Vector2(-5, -1), new Vector2(10, 2))
			]
			const obj = new PongObject(shapeArray, new Vector2())
			expect(obj.getHitbox().length).toEqual(2)
			expect(obj.getOrigin()).toEqual(new Vector2())
			expect(obj.getHitbox()[0].getOrigin()).toEqual(new Vector2())
			expect(obj.getHitbox()[1].getOrigin()).toEqual(new Vector2(-5, -1))
		})
	})

	describe('intersect', () => {
		test('self intersect', () => {
			const obj = new PongObject(
				[new Circle(new Vector2(-1, 0), 2), new Circle(new Vector2(1, 0), 2)],
				new Vector2()
			)

			const res = obj.intersect(obj)
			expect(res).toBeInstanceOf(Array)
			// @ts-ignore
			expect(res?.length >= 2).toBe(true)
			expect(res?.some((e) => e.hitPoint.equals(new Vector2(0, 1.73205))))
			expect(res?.some((e) => e.hitPoint.equals(new Vector2(0, -1.73205))))
		})
		test('2 circle', () => {
			const c = new Circle(new Vector2(), 2)
			const o1 = new PongObject(c, new Vector2(-1, 0))
			const o2 = new PongObject(c, new Vector2(1, 0))

			const res = o1.intersect(o2)
			expect(res).toBeInstanceOf(Array)
			expect(res?.some((e) => e.hitPoint.equals(new Vector2(0, 1.73205)))).toBe(
				true
			)
			expect(
				res?.some((e) => e.hitPoint.equals(new Vector2(0, -1.73205)))
			).toBe(true)
		})

		test('test relative coord', () => {
			const c = new Circle(new Vector2(), 2)
			const o1 = new PongObject([c], new Vector2(-13, 0))
			const o2 = new PongObject(c, new Vector2(109, 0))
			let res = o1.intersect(o2)

			expect(res).toBe(null)

			o1.setOrigin(new Vector2(-1.5, 0.5))
			o2.setOrigin(new Vector2(1.5, 0.5))
			res = o1.intersect(o2)

			expect(res).toBeInstanceOf(Array)
			expect(res?.some((e) => e.hitPoint.equals(new Vector2(0, 1.82287)))).toBe(
				true
			)
			expect(
				res?.some((e) => e.hitPoint.equals(new Vector2(0, -0.82287)))
			).toBe(true)
		})

		test('multiobj test', () => {
			const c1 = new Circle(new Vector2(-1, 0), 1)
			const c2 = new Circle(new Vector2(1, 0), 1)

			const obj1 = new PongObject([c1, c2], new Vector2(0, 0))
			const obj2 = obj1.clone()
			obj2.setOrigin(new Vector2(0, 10))

			expect(obj2.intersect(obj1)).toBe(null)

			obj1.setOrigin(new Vector2(0, 1))
			obj2.setOrigin(new Vector2(0, -1))

			let res = obj2.intersect(obj1)
			expect(res).toBeInstanceOf(Array)
			expect(res).toHaveLength(2)
			expect(res?.some((e) => e.hitPoint.equals(new Vector2(-1, 0)))).toBe(true)
			expect(res?.some((e) => e.hitPoint.equals(new Vector2(1, 0)))).toBe(true)

			const obj3 = new PongObject(
				new Circle(new Vector2(0, 0), 0.2),
				new Vector2()
			)

			expect(obj1.intersect(obj3)).toBe(null)
			expect(obj2.intersect(obj3)).toBe(null)

			const obj4 = new PongObject(
				new Circle(new Vector2(0, 0), 2.3),
				new Vector2()
			)
			res = obj1.intersect(obj4)
			expect(res).toBeInstanceOf(Array)
			expect(res).toHaveLength(4)
			expect(
				res?.some((e) => e.hitPoint.equals(new Vector2(-1.157477, 1.98752)))
			).toBe(true)
			expect(
				res?.some((e) => e.hitPoint.equals(new Vector2(-1.98752, 1.15747)))
			).toBe(true)
			expect(
				res?.some((e) => e.hitPoint.equals(new Vector2(1.98752, 1.15747)))
			).toBe(true)
			expect(
				res?.some((e) => e.hitPoint.equals(new Vector2(1.157477, 1.98752)))
			).toBe(true)

			res = obj2.intersect(obj4)
			expect(res).toBeInstanceOf(Array)
			expect(res).toHaveLength(4)
			expect(
				res?.some((e) => e.hitPoint.equals(new Vector2(1.157477, -1.98752)))
			).toBe(true)
			expect(
				res?.some((e) => e.hitPoint.equals(new Vector2(1.98752, -1.15747)))
			).toBe(true)
			expect(
				res?.some((e) => e.hitPoint.equals(new Vector2(-1.98752, -1.15747)))
			).toBe(true)
			expect(
				res?.some((e) => e.hitPoint.equals(new Vector2(-1.157477, -1.98752)))
			).toBe(true)
		})

		test('seg', () => {
			const obj = new PongObject(
				new Circle(new Vector2(-3, -1), 3),
				new Vector2()
			)
			const seg = new PongObject(
				new Polygon([new Vector2(0, -8), new Vector2(4, 0)]),
				new Vector2()
			)

			const res = obj.intersect(seg)

			expect(res).toEqual(null)
		})

		test('seg 1', () => {
			const obj = new PongObject(
				new Circle(new Vector2(), 3),
				new Vector2(-3, -1)
			)
			const seg = new PongObject(
				new Polygon([new Vector2(), new Vector2(4, 0)]),
				new Vector2(0, -8)
			)

			const res = obj.intersect(seg)

			expect(res).toEqual(null)
		})
		test('seg 2', () => {
			const obj = new PongObject(
				new Circle(new Vector2(), 3),
				new Vector2(-3, -1)
			)
			const seg = new PongObject(
				new Polygon([new Vector2(-6, -5), new Vector2(4, 0)]),
				new Vector2()
			)

			const res = obj.intersect(seg)

			expect(res).toBeInstanceOf(Array)
			expect(res).toHaveLength(2)
			expect(
				res?.some((e) => e.hitPoint.equals(new Vector2(-3.788854, -3.894427)))
			).toBe(true)
			expect(
				res?.some((e) => e.hitPoint.equals(new Vector2(-0.211145, -2.105572)))
			).toBe(true)
		})

		test('obj inside other', () => {
			const o1 = new PongObject(new Circle(new Vector2(1, 5), 1), new Vector2())
			const o2 = new PongObject(new Circle(new Vector2(), 20), new Vector2())
			const res = o1.intersect(o2)

			expect(res).toBeInstanceOf(Array)
		})
	})
	describe('serialize', () => {
		test('simple circle', () => {
			const obj = new PongObject(
				new Circle(new Vector2(23.5, -2), 5.4),
				new Vector2(-1, 0)
			)
			const o = obj.getOrigin()
			const circle = obj.getHitbox().filter((e) => e instanceof Circle)[0]
			const circleOrigin = circle.getOrigin()
			const circleRad = circle.getRad()
			const buff = obj.serialize()
			const view = new DataView(buff)

			expect(buff.byteLength).toBe(16 + 1 + 25)
			expect(view.getFloat64(0, true)).toBeCloseTo(o.getX())
			expect(view.getFloat64(8, true)).toBeCloseTo(o.getY())
			expect(view.getUint8(16)).toBe(1)
			expect(view.getUint8(17)).toBe(1)
			expect(view.getFloat64(18, true)).toBeCloseTo(circleOrigin.getX())
			expect(view.getFloat64(26, true)).toBeCloseTo(circleOrigin.getY())
			expect(view.getFloat64(34, true)).toBeCloseTo(circleRad)
		})
		test('two circles', () => {
			const obj = new PongObject(
				[
					new Circle(new Vector2(23, 12), 32.3),
					new Circle(new Vector2(-23, 53), 2)
				],
				new Vector2(-12.2, 0.222222)
			)
			const o = obj.getOrigin()
			const circles = obj.getHitbox().filter((e) => e instanceof Circle)
			const circle1Origin = circles[0].getOrigin()
			const circle1Rad = circles[0].getRad()
			const circle2Origin = circles[1].getOrigin()
			const circle2Rad = circles[1].getRad()
			const buff = obj.serialize()
			const view = new DataView(buff)

			expect(buff.byteLength).toBe(16 + 1 + 25 * 2)
			expect(view.getFloat64(0, true)).toBeCloseTo(o.getX())
			expect(view.getFloat64(8, true)).toBeCloseTo(o.getY())
			expect(view.getUint8(16)).toBe(2)
			expect(view.getUint8(17)).toBe(1)
			expect(view.getFloat64(18, true)).toBeCloseTo(circle1Origin.getX())
			expect(view.getFloat64(26, true)).toBeCloseTo(circle1Origin.getY())
			expect(view.getFloat64(34, true)).toBeCloseTo(circle1Rad)
			expect(view.getUint8(42)).toBe(1)
			expect(view.getFloat64(43, true)).toBeCloseTo(circle2Origin.getX())
			expect(view.getFloat64(51, true)).toBeCloseTo(circle2Origin.getY())
			expect(view.getFloat64(59, true)).toBeCloseTo(circle2Rad)
		})
		test('one poly', () => {
			const polyPoints = [
				new Vector2(0, 0),
				new Vector2(1, 0),
				new Vector2(0, 4)
			]
			const polyOrigin = new Vector2(23, -23)
			const objOrigin = new Vector2(-1, -2)
			const obj = new PongObject(new Polygon(polyPoints, polyOrigin), objOrigin)
			const buff = obj.serialize()
			const view = new DataView(buff)

			expect(buff.byteLength).toBe(16 + 1 + 18 + 3 * 16)
			expect(view.getFloat64(0, true)).toBeCloseTo(objOrigin.getX())
			expect(view.getFloat64(8, true)).toBeCloseTo(objOrigin.getY())
			expect(view.getUint8(16)).toBe(1)
			expect(view.getUint8(17)).toBe(2)
			expect(view.getFloat64(18, true)).toBeCloseTo(polyOrigin.getX())
			expect(view.getFloat64(26, true)).toBeCloseTo(polyOrigin.getY())
			expect(view.getUint8(34)).toBe(3)
			expect(view.getFloat64(35, true)).toBeCloseTo(0)
			expect(view.getFloat64(43, true)).toBeCloseTo(0)
			expect(view.getFloat64(51, true)).toBeCloseTo(1)
			expect(view.getFloat64(59, true)).toBeCloseTo(0)
			expect(view.getFloat64(67, true)).toBeCloseTo(0)
			expect(view.getFloat64(75, true)).toBeCloseTo(4)
		})
	})

	describe('PongObject.deserialize', () => {
		test('circle is correctly deserialized', () => {
			const obj = new PongObject(
				new Circle(new Vector2(5, 7), 42),
				new Vector2(-3, 12)
			)
			const buff = obj.serialize()
			const clone = PongObject.deserialize(buff)

			expect(clone.getOrigin().getX()).toBeCloseTo(-3)
			expect(clone.getOrigin().getY()).toBeCloseTo(12)

			expect(clone.getHitbox()).toHaveLength(1)
			const hitbox = clone.getHitbox()[0] as Circle
			expect(hitbox).toBeInstanceOf(Circle)
			expect(hitbox.getOrigin().getX()).toBeCloseTo(5)
			expect(hitbox.getOrigin().getY()).toBeCloseTo(7)
			expect(hitbox.getRad()).toBeCloseTo(42)
		})

		test('polygon is correctly deserialized', () => {
			const points = [
				new Vector2(0, 0),
				new Vector2(1.1, 3),
				new Vector2(-5, 77)
			]
			const polyOrigin = new Vector2(12, -9)
			const objOrigin = new Vector2(0, 0)
			const obj = new PongObject(new Polygon(points, polyOrigin), objOrigin)
			const buff = obj.serialize()
			const clone = PongObject.deserialize(buff)

			expect(clone.getOrigin().getX()).toBeCloseTo(objOrigin.getX())
			expect(clone.getOrigin().getY()).toBeCloseTo(objOrigin.getY())

			expect(clone.getHitbox()).toHaveLength(1)
			const poly = clone.getHitbox()[0] as Polygon
			expect(poly).toBeInstanceOf(Polygon)
			expect(poly.getOrigin().getX()).toBeCloseTo(polyOrigin.getX())
			expect(poly.getOrigin().getY()).toBeCloseTo(polyOrigin.getY())

			const pts = poly.getSegment()
			expect(pts).toHaveLength(3)
			expect(pts[0].getP1().getX()).toBeCloseTo(0)
			expect(pts[0].getP1().getY()).toBeCloseTo(0)
			expect(pts[1].getP1().getX()).toBeCloseTo(1.1)
			expect(pts[1].getP1().getY()).toBeCloseTo(3)
			expect(pts[2].getP1().getX()).toBeCloseTo(-5)
			expect(pts[2].getP1().getY()).toBeCloseTo(77)
		})

		test('object with two circles is correctly deserialized', () => {
			const c1 = new Circle(new Vector2(1, 2), 3)
			const c2 = new Circle(new Vector2(4, 5), 6)
			const objOrigin = new Vector2(11, 22)
			const obj = new PongObject([c1, c2], objOrigin)

			const buff = obj.serialize()
			const clone = PongObject.deserialize(buff)

			expect(clone.getOrigin().getX()).toBeCloseTo(objOrigin.getX())
			expect(clone.getOrigin().getY()).toBeCloseTo(objOrigin.getY())

			expect(clone.getHitbox()).toHaveLength(2)

			const d1 = clone.getHitbox()[0] as Circle
			const d2 = clone.getHitbox()[1] as Circle

			expect(d1).toBeInstanceOf(Circle)
			expect(d2).toBeInstanceOf(Circle)

			expect(d1.getOrigin().getX()).toBeCloseTo(c1.getOrigin().getX())
			expect(d1.getOrigin().getY()).toBeCloseTo(c1.getOrigin().getY())
			expect(d1.getRad()).toBeCloseTo(c1.getRad())

			expect(d2.getOrigin().getX()).toBeCloseTo(c2.getOrigin().getX())
			expect(d2.getOrigin().getY()).toBeCloseTo(c2.getOrigin().getY())
			expect(d2.getRad()).toBeCloseTo(c2.getRad())
		})
	})

	describe('serialize/deserialize round-trip', () => {
		test('circle: serialization round-trip', () => {
			const objOrigin = new Vector2(10, -3)
			const circleOrigin = new Vector2(2.5, 5.1)
			const circleRadius = 15.2
			const obj = new PongObject(
				new Circle(circleOrigin, circleRadius),
				objOrigin
			)

			const buff = obj.serialize()
			const clone = PongObject.deserialize(buff)

			expect(clone.getOrigin().getX()).toBeCloseTo(objOrigin.getX())
			expect(clone.getOrigin().getY()).toBeCloseTo(objOrigin.getY())

			expect(clone.getHitbox()).toHaveLength(1)
			const c = clone.getHitbox()[0] as Circle
			expect(c).toBeInstanceOf(Circle)
			expect(c.getOrigin().getX()).toBeCloseTo(circleOrigin.getX())
			expect(c.getOrigin().getY()).toBeCloseTo(circleOrigin.getY())
			expect(c.getRad()).toBeCloseTo(circleRadius)
		})

		test('object with 2 circles: serialization round-trip', () => {
			const objOrigin = new Vector2(1.2, -8.7)
			const circles = [
				new Circle(new Vector2(2, 5), 99.9),
				new Circle(new Vector2(-10, 0.53), 1.55)
			]
			const obj = new PongObject(circles, objOrigin)

			const buff = obj.serialize()
			const clone = PongObject.deserialize(buff)

			expect(clone.getOrigin().getX()).toBeCloseTo(objOrigin.getX())
			expect(clone.getOrigin().getY()).toBeCloseTo(objOrigin.getY())

			expect(clone.getHitbox()).toHaveLength(2)
			const c0 = clone.getHitbox()[0] as Circle
			const c1 = clone.getHitbox()[1] as Circle
			expect(c0.getOrigin().getX()).toBeCloseTo(circles[0].getOrigin().getX())
			expect(c0.getOrigin().getY()).toBeCloseTo(circles[0].getOrigin().getY())
			expect(c0.getRad()).toBeCloseTo(circles[0].getRad())
			expect(c1.getOrigin().getX()).toBeCloseTo(circles[1].getOrigin().getX())
			expect(c1.getOrigin().getY()).toBeCloseTo(circles[1].getOrigin().getY())
			expect(c1.getRad()).toBeCloseTo(circles[1].getRad())
		})

		test('polygon: serialization round-trip', () => {
			const objOrigin = new Vector2(-1, -2)
			const polyOrigin = new Vector2(23, -23)
			const polyPoints = [
				new Vector2(0, 0),
				new Vector2(1, 0),
				new Vector2(0, 4)
			]
			const obj = new PongObject(new Polygon(polyPoints, polyOrigin), objOrigin)

			const buff = obj.serialize()
			const clone = PongObject.deserialize(buff)

			expect(clone.getOrigin().getX()).toBeCloseTo(objOrigin.getX())
			expect(clone.getOrigin().getY()).toBeCloseTo(objOrigin.getY())
			expect(clone.getHitbox()).toHaveLength(1)

			const poly = clone.getHitbox()[0] as Polygon
			expect(poly).toBeInstanceOf(Polygon)
			expect(poly.getOrigin().getX()).toBeCloseTo(polyOrigin.getX())
			expect(poly.getOrigin().getY()).toBeCloseTo(polyOrigin.getY())
			const pts = poly.getSegment()
			expect(pts).toHaveLength(polyPoints.length)
			for (let i = 0; i < polyPoints.length; i++) {
				expect(pts[i].getP1().getX()).toBeCloseTo(polyPoints[i].getX())
				expect(pts[i].getP1().getY()).toBeCloseTo(polyPoints[i].getY())
			}
		})

		test('mixture polygon + circle: serialization round-trip', () => {
			const objOrigin = new Vector2(3, 7.7)
			const polyOrigin = new Vector2(-5, -5)
			const polyPoints = [
				new Vector2(1, 1),
				new Vector2(2, 2),
				new Vector2(3, 3),
				new Vector2(2, 1)
			]
			const circle = new Circle(new Vector2(44, -2), 19)
			const polygon = new Polygon(polyPoints, polyOrigin)
			const obj = new PongObject([circle, polygon], objOrigin)

			const buff = obj.serialize()
			const clone = PongObject.deserialize(buff)

			expect(clone.getOrigin().getX()).toBeCloseTo(objOrigin.getX())
			expect(clone.getOrigin().getY()).toBeCloseTo(objOrigin.getY())
			expect(clone.getHitbox()).toHaveLength(2)

			let circleDes: Circle | undefined
			let polyDes: Polygon | undefined
			for (const h of clone.getHitbox()) {
				if (h instanceof Circle) circleDes = h
				if (h instanceof Polygon) polyDes = h
			}
			expect(circleDes).toBeDefined()
			expect(polyDes).toBeDefined()

			expect(circleDes!.getOrigin().getX()).toBeCloseTo(
				circle.getOrigin().getX()
			)
			expect(circleDes!.getOrigin().getY()).toBeCloseTo(
				circle.getOrigin().getY()
			)
			expect(circleDes!.getRad()).toBeCloseTo(circle.getRad())

			expect(polyDes!.getOrigin().getX()).toBeCloseTo(polyOrigin.getX())
			expect(polyDes!.getOrigin().getY()).toBeCloseTo(polyOrigin.getY())
			const pts = polyDes!.getSegment()
			expect(pts).toHaveLength(polyPoints.length)
			for (let i = 0; i < polyPoints.length; i++) {
				expect(pts[i].getP1().getX()).toBeCloseTo(polyPoints[i].getX())
				expect(pts[i].getP1().getY()).toBeCloseTo(polyPoints[i].getY())
			}
		})
	})
})
