import { EPSILON } from '../define.js'
import { IIntersect } from './IIntersect.js'
import { Segment } from './Segment.js'
import { Circle } from './shapes/Circle.js'
import { Vector2 } from './Vector2.js'

export class Ray {
	private direction!: Vector2
	constructor(
		private origin: Vector2,
		direction: Vector2
	) {
		this.setDirection(direction.normalize())
	}

	getOrigin(): Vector2 {
		return this.origin
	}

	getDirection(): Vector2 {
		return this.direction
	}

	setDirection(direction: Vector2): void {
		this.direction = direction
	}

	setOrigin(origin: Vector2): void {
		this.origin = origin
	}

	static RayFromPoints(p1: Vector2, p2: Vector2) {
		return new Ray(p1, Vector2.subtract(p2, p1).normalize())
	}

	intersect(other: Segment, otherNormal: boolean): IIntersect[] | null
	intersect(other: Ray, otherNormal: boolean): IIntersect[] | null
	intersect(other: Circle, otherNormal: boolean): IIntersect[] | null

	intersect(
		other: Segment | Circle | Ray,
		otherNormal: boolean = false
	): IIntersect[] | null {
		if (other instanceof Segment) {
			return this.intersectSegment(other, otherNormal)
		} else if (other instanceof Ray) {
			return this.intersectRay(other, otherNormal)
		} else if (other instanceof Circle) {
			return other.intersect(this, otherNormal)
		}
		throw 'Invalid type'
	}

	private intersectRay(other: Ray, otherNormal: boolean): IIntersect[] | null {
		const crossProduct = this.getDirection().cross(other.getDirection())

		if (Math.abs(crossProduct) < EPSILON) {
			return null
		}

		const t1 =
			Vector2.subtract(other.getOrigin(), this.getOrigin()).cross(
				other.getDirection()
			) / crossProduct
		const t2 =
			Vector2.subtract(other.getOrigin(), this.getOrigin()).cross(
				this.getDirection()
			) / crossProduct

		if (t1 >= 0 && t2 >= 0) {
			const intersectionPoint = Vector2.add(
				this.getOrigin(),
				this.getDirection().multiply(t1)
			)
			return [
				{
					hitPoint: intersectionPoint,
					normal: new Segment(
						otherNormal ? other.getOrigin() : this.origin,
						intersectionPoint
					).getNormal()
				}
			]
		}
		return null
	}

	private intersectSegment(
		other: Segment,
		otherNormal: boolean
	): IIntersect[] | null {
		const O = this.getOrigin()
		const D = this.getDirection()
		const A = other.getP1()
		const B = other.getP2()

		const v1 = Vector2.subtract(O, A)
		const v2 = Vector2.subtract(B, A)
		const denom = Vector2.cross(D, v2)

		if (Math.abs(denom) < EPSILON) {
			const dDot = Vector2.dot(D, D)
			if (
				dDot < EPSILON ||
				Math.abs(Vector2.cross(Vector2.subtract(A, O), D)) > EPSILON
			) {
				return null
			}

			const tA = Vector2.dot(Vector2.subtract(A, O), D) / dDot
			const tB = Vector2.dot(Vector2.subtract(B, O), D) / dDot
			const tMin = Math.min(tA, tB)
			const tMax = Math.max(tA, tB)
			const tOverlapStart = Math.max(0, tMin)
			const tOverlapEnd = tMax

			if (tOverlapStart > tOverlapEnd) {
				return null
			}

			const hitPoint = Vector2.add(O, D.clone().multiply(tOverlapStart))
			return [
				{
					hitPoint: hitPoint,
					normal: otherNormal
						? other.getNormal()
						: new Segment(this.getOrigin(), hitPoint).getNormal()
				}
			]
		}
		const t1 = Vector2.cross(v2, v1) / denom
		const t2 = Vector2.cross(D, v1) / denom

		if (t1 >= 0 && t2 >= 0 && t2 <= 1) {
			const intersectionPoint = Vector2.add(O, D.clone().multiply(t1))
			return [
				{
					hitPoint: intersectionPoint,
					normal: otherNormal
						? other.getNormal()
						: new Segment(this.getOrigin(), intersectionPoint).getNormal()
				}
			]
		}

		return null
	}
}
