import { Ray } from '../Ray.js'
import { IIntersect } from '../IIntersect.js'
import { Segment } from '../Segment.js'
import { Vector2 } from '../Vector2.js'
import { Polygon } from './Polygon.js'
import { AShape } from './AShape.js'

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

	
	intersect(other: Segment): IIntersect[] | null
	intersect(other: Circle): IIntersect[] | null
	intersect(other: Ray): IIntersect[] | null
	intersect(other: Polygon): IIntersect[] | null

	intersect(other: Segment | Ray | Polygon | Circle): IIntersect[] | null {
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

	private intersectRay(other: Ray): IIntersect[] | null {
		function getHitPoint(ray: Ray, t: number): Vector2 {
			return Vector2.add(
				ray.getOrigin(),
				Vector2.multiply(ray.getDirection(), t)
			)
		}

		const op = Vector2.subtract(this.getOrigin(), other.getOrigin())
		const squaredRad = this.getRad() ** 2
		const dotOp = Vector2.dot(op, op)

		const D = Vector2.dot(other.getDirection(), op)
		const H2 = dotOp - D ** 2

		if (H2 > squaredRad) {
			return null
		}

		const K = Math.sqrt(squaredRad - H2)

		if (dotOp <= squaredRad) {
			const t = D + K
			return [{hitPoint:getHitPoint(other, t)}]
		}

		const t1 = D - K
		const t2 = D + K

		if (t1 < 0) {
			return null
		}

		const p1 = getHitPoint(other, t1)
		const p2 = getHitPoint(other, t2)

		if (p1.equals(p2)) {
			return [{hitPoint: p1}]
		}
		return [{hitPoint: p1}, {hitPoint: p2}]
	}

	private intersectCircle(other: Circle): IIntersect[] | null {
		let d = Vector2.subtract(other.getPos(), this.origin)
		const sqDistance = d.squaredLength()
		const radiusSum = this.rad + other.getRad()
		d.normalize()

		if (sqDistance > radiusSum ** 2) {
			return null
		}

		// weird fix
		if (sqDistance <= 0) {
			return [this.getRad() > other.getRad() ? {hitPoint: other.getPos()} : {hitPoint: this.getPos()}]
		}

		const distance = Math.sqrt(sqDistance)

		if (distance === radiusSum) {
			return [{hitPoint: Vector2.add(this.origin, d.multiply(this.rad))}]
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

		// weird fix
		if (
			isNaN(t1.getX()) ||
			isNaN(t2.getX()) ||
			isNaN(t1.getY()) ||
			isNaN(t2.getY())
		) {
			return [this.getRad() > other.getRad() ? {hitPoint: other.getPos()} : {hitPoint: this.getPos()}]
		}
		return [{hitPoint: t1}, {hitPoint: t2}]
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
