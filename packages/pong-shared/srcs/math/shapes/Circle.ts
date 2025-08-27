import { Ray } from '../Ray'
import { Segment } from '../Segment'
import { Vector2 } from '../Vector2'
import { Polygon } from './Polygon'
import { Shape } from './Shape'

export class Circle extends Shape {
	private rad!: number

	constructor(origin: Vector2 = new Vector2(), rad: number) {
		super(origin)
		this.setRad(rad)
	}

	public getPos(): Vector2 {
		return this.origin
	}

	public getRad(): number {
		return this.rad
	}

	setRad(rad: number): void {
		if (rad <= 0) {
			throw 'Invlalid Radius'
		}
		this.rad = rad
	}

	intersect(other: Segment): boolean
	intersect(other: Circle): boolean
	intersect(other: Ray): boolean
	intersect(other: Polygon): boolean

	intersect(other: Segment | Ray | Polygon | Circle): boolean {
		if (other instanceof Segment) {
			return other.intersect(this)
		} else if (other instanceof Circle) {
			return this.intersectCircle(other)
		} else if (other instanceof Ray) {
			return this.intersectRay(other)
		} else if (other instanceof Polygon) {
			return other.intersect(this)
		}
		throw 'Invalid type'
	}

	private intersectRay(other: Ray): boolean {
		const rayOrigin = other.getOrigin()
		const rayDirection = other.getDirection()

		const squaredDistanceToCenter = Vector2.squaredDist(
			rayOrigin,
			this.getPos()
		)
		const squaredRadius = this.getRad() * this.getRad()

		if (squaredDistanceToCenter <= squaredRadius) {
			return true
		}

		const toCircle = Vector2.subtract(this.getPos(), rayOrigin)
		const projection = Vector2.dot(toCircle, rayDirection)

		if (projection < 0) {
			return false
		}

		const scaledDirection = Vector2.multiply(rayDirection, projection)
		const closestPoint = Vector2.add(rayOrigin, scaledDirection)
		const squaredDistanceToClosest = Vector2.squaredDist(
			closestPoint,
			this.getPos()
		)

		return squaredDistanceToClosest <= squaredRadius
	}

	private intersectCircle(other: Circle): boolean {
		const sqDistance: number = this.origin.squaredDist(other.getPos())
		return sqDistance <= (this.rad + other.getRad()) ** 2
	}

	public containsPoint(point: Vector2): boolean {
		const sqDistance: number = this.getPos().squaredDist(point)
		return sqDistance <= this.getRad() ** 2
	}

	public clone(): Circle {
		return new Circle(this.getPos().clone(), this.rad)
	}
}
