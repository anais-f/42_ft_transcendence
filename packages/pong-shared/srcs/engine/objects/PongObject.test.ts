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
				new Vector2(5, 5),
				new Vector2()
			)
			expect(obj.getHitbox().length === 1).toBe(true)
			expect(obj.getVelocity()).toEqual(new Vector2())
			expect(obj.getOrigin()).toEqual(new Vector2(5, 5))
		})

		test('array init', () => {
			const shapeArray = [
				new Circle(new Vector2(), 5),
				new Rectangle(new Vector2(-5, -1), new Vector2(10, 2)),
			]
			const obj = new PongObject(shapeArray, new Vector2(), new Vector2())
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
				new Vector2(),
				new Vector2()
			)

			expect(obj.intersect(obj)).toBeGreaterThanOrEqual(0)
		})

		test('2 circle', () => {
			const c = new Circle(new Vector2(), 2)
			const o1 = new PongObject(c, new Vector2(-1, 0), new Vector2())
			const o2 = new PongObject(c, new Vector2(1, 0), new Vector2())

			expect(o1.intersect(o2)).toBeGreaterThanOrEqual(0)
		})

		test('test relative coord', () => {
			const c = new Circle(new Vector2(), 2)
			const o1 = new PongObject(c, new Vector2(-13, 0), new Vector2())
			const o2 = new PongObject(c, new Vector2(109, 0), new Vector2())

			expect(o1.intersect(o2)).toEqual(-1)

			o1.setOrigin(new Vector2(-1.5, 0.5))
			o2.setOrigin(new Vector2(1.5, 0.5))

			expect(o1.intersect(o2)).toBeGreaterThanOrEqual(0)
		})

		test('multiobj test', () => {
			const c1 = new Circle(new Vector2(-1, 0), 1)
			const c2 = new Circle(new Vector2(1, 0), 1)

			const obj1 = new PongObject([c1, c2], new Vector2(0, 0))
			const obj2 = obj1.clone()
			obj2.setOrigin(new Vector2(0, 10))

			expect(obj2.intersect(obj1)).toEqual(-1)

			obj1.setOrigin(new Vector2(0, 1))
			obj2.setOrigin(new Vector2(0, -1))
			expect(obj2.intersect(obj1)).toBeGreaterThanOrEqual(0)

			const obj3 = new PongObject(
				new Circle(new Vector2(0, 0), 0.2),
				new Vector2(),
				new Vector2()
			)

			expect(obj1.intersect(obj3)).toEqual(-1)
			expect(obj2.intersect(obj3)).toEqual(-1)
		})

		test('obj inside other', () => {
			const o1 = new PongObject(new Circle(new Vector2(1, 5), 1), new Vector2())
			const o2 = new PongObject(new Circle(new Vector2(), 20), new Vector2())
			expect(o1.intersect(o2)).toBeGreaterThanOrEqual(0)
		})
	})
})
