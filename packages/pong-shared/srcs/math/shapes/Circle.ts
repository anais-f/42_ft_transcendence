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

	intersect(other: Segment, otherNormal: boolean): IIntersect[] | null
	intersect(other: Circle, otherNormal: boolean): IIntersect[] | null
	intersect(other: Ray, otherNormal: boolean): IIntersect[] | null
	intersect(other: Polygon, otherNormal: boolean): IIntersect[] | null

	intersect(
		other: Segment | Ray | Polygon | Circle,
		otherNormal: boolean
	): IIntersect[] | null {
		if (other instanceof Segment) {
			return other.intersect(this, !otherNormal)
		} else if (other instanceof Circle) {
			return this.intersectCircle(other, otherNormal)
		} else if (other instanceof Ray) {
			return this.intersectRay(other, otherNormal)
		} else if (other instanceof Polygon) {
			return other.intersect(this, !otherNormal)
		}
		throw 'Invalid type'
	}

	private intersectRay(other: Ray, otherNormal: boolean): IIntersect[] | null {
		function getHitPoint(ray: Ray, t: number): Vector2 {
			return Vector2.add(
				ray.getOrigin(),
				Vector2.multiply(ray.getDirection(), t)
			)
		}

		const op = Vector2.subtract(this.getPos(), other.getOrigin())
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
			const point = getHitPoint(other, t)
			return [
				{
					hitPoint: point,
					normal: otherNormal
						? new Segment(other.getOrigin(), point).getNormal()
						: this.getNormalAt(point)
				}
			]
		}

		const t1 = D - K
		const t2 = D + K

		if (t1 < 0) {
			return null
		}

		const p1 = getHitPoint(other, t1)
		const p2 = getHitPoint(other, t2)

		if (p1.equals(p2)) {
			return [
				{
					hitPoint: p1,
					normal: otherNormal
						? new Segment(other.getOrigin(), p1).getNormal()
						: this.getNormalAt(p1)
				}
			]
		}
		return [
			{
				hitPoint: p1,
				normal: otherNormal
					? new Segment(other.getOrigin(), p1).getNormal()
					: this.getNormalAt(p1)
			},
			{
				hitPoint: p2,
				normal: otherNormal
					? new Segment(other.getOrigin(), p2).getNormal()
					: this.getNormalAt(p2)
			}
		]
	}

	private intersectCircle(
		other: Circle,
		otherNormal: boolean
	): IIntersect[] | null {
		let d = Vector2.subtract(other.getPos(), this.origin)
		const sqDistance = d.squaredLength()
		const radiusSum = this.rad + other.getRad()
		d.normalize()

		if (sqDistance > radiusSum ** 2) {
			return null
		}

		// weird fix
		if (sqDistance <= 0) {
			return [
				this.getRad() > other.getRad()
					? {
							hitPoint: other.getPos(),
							normal: otherNormal
								? other.getNormalAt(other.getPos())
								: this.getNormalAt(other.getPos())
						}
					: {
							hitPoint: this.getPos(),
							normal: otherNormal
								? other.getNormalAt(this.getPos())
								: this.getNormalAt(this.getPos())
						}
			]
		}

		const distance = Math.sqrt(sqDistance)

		if (distance === radiusSum) {
			const hp = Vector2.add(this.origin, d.multiply(this.rad))
			return [
				{
					hitPoint: hp,
					normal: otherNormal ? other.getNormalAt(hp) : this.getNormalAt(hp)
				}
			]
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
			return [
				this.getRad() > other.getRad()
					? {
							hitPoint: other.getPos(),
							normal: otherNormal
								? other.getNormalAt(other.getPos())
								: this.getNormalAt(other.getPos())
						}
					: {
							hitPoint: this.getPos(),
							normal: otherNormal
								? other.getNormalAt(this.getPos())
								: this.getNormalAt(this.getPos())
						}
			]
		}
		return [
			{
				hitPoint: t1,
				normal: otherNormal ? other.getNormalAt(t1) : this.getNormalAt(t1)
			},
			{
				hitPoint: t2,
				normal: otherNormal ? other.getNormalAt(t2) : this.getNormalAt(t2)
			}
		]
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
