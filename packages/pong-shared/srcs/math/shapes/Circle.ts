import { Ray } from '../Ray'
import { Segment } from '../Segment'
import { Vector2 } from '../Vector2'
import { Polygon } from './Polygon'
import { AShape } from './AShape'

export class Circle extends AShape {
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

	intersect(other: Segment): Vector2[] | null
	intersect(other: Circle): Vector2[] | null
	intersect(other: Ray): Vector2[] | null
	intersect(other: Polygon): Vector2[] | null

	intersect(other: Segment | Ray | Polygon | Circle): Vector2[] | null {
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

	private intersectRay(other: Ray): Vector2[] | null {
		const rayOrigin = other.getOrigin()
		const rayDirection = other.getDirection()
		const squaredDistanceToCenter = Vector2.squaredDist(
			rayOrigin,
			this.getPos()
		)
		const squaredRadius = this.getRad() * this.getRad()

		if (squaredDistanceToCenter <= squaredRadius) {
			return [new Vector2(rayOrigin.getX(), rayOrigin.getY())]
		}

		const toCircle = Vector2.subtract(this.getPos(), rayOrigin)
		const projection = Vector2.dot(toCircle, rayDirection)

		if (projection < 0) {
			return null
		}

		const scaledDirection = Vector2.multiply(rayDirection, projection)
		const closestPoint = Vector2.add(rayOrigin, scaledDirection)
		const squaredDistanceToClosest = Vector2.squaredDist(
			closestPoint,
			this.getPos()
		)

		if (squaredDistanceToClosest <= squaredRadius) {
			const distanceToIntersection = Math.sqrt(
				squaredRadius - squaredDistanceToClosest
			)
			const t1 = Vector2.add(
				closestPoint,
				Vector2.multiply(rayDirection, distanceToIntersection)
			)
			const t2 = Vector2.subtract(
				closestPoint,
				Vector2.multiply(rayDirection, distanceToIntersection)
			)
			
			if (t1.equals(t2)) {
				return [t1]
			}
			return [t1, t2]
		}

		return null
	}

	private intersectCircle(other: Circle): Vector2[] | null {
		let d = Vector2.subtract(other.getPos(), this.origin)
		const sqDistance = d.squaredLength()
		const radiusSum = this.rad + other.getRad()
		d.normalize()

		if (sqDistance > radiusSum ** 2) {
			return null
		}

		const distance = Math.sqrt(sqDistance)

		if (distance === radiusSum) {
			return [Vector2.add(this.origin, d.multiply(this.rad))]
		}

		const a =
			(this.rad ** 2 - other.getRad() ** 2 + sqDistance) / (2 * distance)
		const h = Math.sqrt(this.rad ** 2 - a ** 2)

		const p2 = Vector2.add(this.origin, d.multiply(a))

		const t1 = new Vector2(
			p2.getX() + (h * (other.getPos().getY() - this.origin.getY())) / distance,
			p2.getY() - (h * (other.getPos().getX() - this.origin.getX())) / distance
		)

		const t2 = new Vector2(
			p2.getX() - (h * (other.getPos().getY() - this.origin.getY())) / distance,
			p2.getY() + (h * (other.getPos().getX() - this.origin.getX())) / distance
		)

		return [t1, t2]
	}

	public containsPoint(point: Vector2): boolean {
		const sqDistance: number = this.getPos().squaredDist(point)
		return sqDistance <= this.getRad() ** 2
	}

	public clone(): Circle {
		return new Circle(this.getPos().clone(), this.rad)
	}

	public getNormalAt(point: Vector2): Vector2 {
		return Vector2.subtract(point, this.getOrigin()).normalize()
	}
}
