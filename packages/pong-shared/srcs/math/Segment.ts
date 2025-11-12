import { merge } from 'node_modules/zod/v4/core/util.cjs'
import { EPSILON } from '../define.js'
import { Ray } from './Ray.js'
import { Vector2 } from './Vector2.js'
import { Circle } from './shapes/Circle.js'
import { Polygon } from './shapes/Polygon.js'

export class Segment {
	constructor(
		private p1: Vector2,
		private p2: Vector2
	) {}

	getPoints(): Vector2[] {
		return [this.p1, this.p2]
	}

	getP1() {
		return this.p1
	}

	getP2() {
		return this.p2
	}

	intersect(other: Circle): Vector2[] | null
	intersect(other: Segment): Vector2[] | null
	intersect(other: Polygon): Vector2[] | null
	intersect(other: Ray): Vector2[] | null
	intersect(other: Circle | Segment | Polygon | Ray): Vector2[] | null {
		if (other instanceof Circle) {
			return this.intersectCircle(other)
		} else if (other instanceof Segment) {
			return this.intersectSeg(other)
		} else if (other instanceof Polygon) {
			return other.intersect(this)
		} else if (other instanceof Ray) {
			return other.intersect(this)
		}
		throw 'invalid Type in segment intersect'
	}

	private intersectSeg(other: Segment): Vector2[] | null {
		const [a1, a2] = [this.p1, this.p2]
		const [b1, b2] = other.getPoints()

		function direction(p: Vector2, q: Vector2, r: Vector2): number {
			return Vector2.cross(Vector2.subtract(q, p), Vector2.subtract(r, p))
		}
		const d1 = direction(b1, b2, a1)
		const d2 = direction(b1, b2, a2)
		const d3 = direction(a1, a2, b1)
		const d4 = direction(a1, a2, b2)

		if (
			((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
			((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
		) {
			const t = d1 / (d1 - d2)
			const intersectionPoint = Vector2.add(
				a1,
				Vector2.subtract(a2, a1).multiply(t)
			)
			return [intersectionPoint]
		}

		let points: Vector2[] = []
		if (a1.equals(b1) || a1.equals(b2)) {
			points.push(a1)
		}
		if (a2.equals(b1) || a2.equals(b2)) {
			points.push(a2)
		}

		const colinear =
			Math.abs(direction(a1, a2, b1)) < EPSILON &&
			Math.abs(direction(a1, a2, b2)) < EPSILON
		if (colinear) {
			const allPoints = [a1, a2, b1, b2]
			const overlap: Vector2[] = []
			for (let pt of allPoints) {
				if (
					Segment.pointIsOnSeg(a1, a2, pt) &&
					Segment.pointIsOnSeg(b1, b2, pt)
				) {
					if (!overlap.some((p) => p.equals(pt))) {
						overlap.push(pt)
					}
				}
			}
			if (overlap.length >= 2) {
				overlap.sort((p1, p2) =>
					p1.getX() !== p2.getX()
						? p1.getX() - p2.getX()
						: p1.getY() - p2.getY()
				)
				return overlap
			}
		}

		if (points.length > 0) {
			return points
		}

		return null
	}

	intersectCircle(other: Circle): Vector2[] | null {
		const a = this.p1
		const b = this.p2
		const center = other.getPos()
		const radius = other.getRad()

		const aIn = Vector2.subtract(a, center).squaredLength() <= radius * radius
		const bIn = Vector2.subtract(b, center).squaredLength() <= radius * radius

		if (aIn && bIn) {
			return [a.clone(), b.clone()]
		}

		const d = Vector2.subtract(b, a)
		const f = Vector2.subtract(a, center)

		const aCoeff = Vector2.dot(d, d)
		const bCoeff = 2 * Vector2.dot(f, d)
		const cCoeff = Vector2.dot(f, f) - radius * radius

		const discriminant = bCoeff * bCoeff - 4 * aCoeff * cCoeff
		if (discriminant < 0) {
			return null
		}

		const sqrtDiscriminant = Math.sqrt(discriminant)
		const t1 = (-bCoeff - sqrtDiscriminant) / (2 * aCoeff)
		const t2 = (-bCoeff + sqrtDiscriminant) / (2 * aCoeff)

		const points: Vector2[] = []
		if (t1 >= 0 && t1 <= 1) {
			points.push(Vector2.add(a, Vector2.multiply(d, t1)))
		}
		if (t2 >= 0 && t2 <= 1 && t2 !== t1) {
			points.push(Vector2.add(a, Vector2.multiply(d, t2)))
		}

		if ((aIn || bIn) && points.length === 1) {
			return [/*aIn ? a : b,*/ points[0]]
		}

		if (points.length > 0) {
			return points
		}

		return null
	}

	static pointIsOnSeg(p1: Vector2, p2: Vector2, point: Vector2): boolean {
		const crossProduct =
			(point.getY() - p1.getY()) * (p2.getX() - p1.getX()) -
			(point.getX() - p1.getX()) * (p2.getY() - p1.getY())

		if (Math.abs(crossProduct) > EPSILON) {
			return false
		}

		return (
			point.getX() >= Math.min(p1.getX(), p2.getX()) &&
			point.getX() <= Math.max(p1.getX(), p2.getX()) &&
			point.getY() >= Math.min(p1.getY(), p2.getY()) &&
			point.getY() <= Math.max(p1.getY(), p2.getY())
		)
	}

	static containPoint(s: Segment, p: Vector2) {
		return Segment.pointIsOnSeg(s.getP1(), s.getP2(), p)
	}

	public contain(p: Vector2): boolean {
		return Segment.pointIsOnSeg(this.p1, this.p2, p)
	}

	public distanceToPoint(point: Vector2): number {
		const closestPoint = this.closestPointToPoint(point)
		return point.dist(closestPoint)
	}

	public closestPointToPoint(point: Vector2): Vector2 {
		const segmentVector = Vector2.subtract(this.p2, this.p1)
		const segmentLengthSquared = segmentVector.squaredLength()

		if (segmentLengthSquared === 0) {
			return this.p1.clone()
		}

		const pointVector = Vector2.subtract(point, this.p1)
		const projection =
			Vector2.dot(pointVector, segmentVector) / segmentLengthSquared

		if (projection <= 0) return this.p1.clone()
		if (projection >= 1) return this.p2.clone()

		const segmentVectorClone = segmentVector.clone()
		return Vector2.add(this.p1, segmentVectorClone.multiply(projection))
	}

	public getNormal(): Vector2 {
		const dx = this.p2.getX() - this.p1.getX()
		const dy = this.p2.getY() - this.p1.getY()
		const normal = new Vector2(-dy, dx)

		return normal.normalize()
	}

	public serialize(): ArrayBuffer {
		// 32o
		const merged = new Uint8Array(32)
		merged.set(new Uint8Array(this.getP1().serialize()), 0)
		merged.set(new Uint8Array(this.getP2().serialize()), 16)
		return merged.buffer
	}
}
