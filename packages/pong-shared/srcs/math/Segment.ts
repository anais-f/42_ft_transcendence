import { EPSILON } from '../define.js'
import { Vector2 } from './Vector2.js'
import { Circle } from './Circle.js'

export class Segment {
	constructor(
		private _p1: Vector2,
		private _p2: Vector2
	) {}

	get points(): Vector2[] {
		return [this._p1, this._p2]
	}

	get p1(): Vector2 {
		return this._p1
	}

	get p2(): Vector2 {
		return this._p2
	}

	intersect(other: Circle): Vector2[] | null
	intersect(other: Segment): Vector2[] | null
	intersect(other: Circle | Segment): Vector2[] | null {
		if (other instanceof Circle) {
			return this.intersectCircle(other)
		} else if (other instanceof Segment) {
			return this.intersectSeg(other)
		}
		throw 'invalid Type in segment intersect'
	}

	private intersectSeg(other: Segment): Vector2[] | null {
		const [a1, a2] = [this._p1, this._p2]
		const [b1, b2] = other.points

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
			return [Vector2.add(a1, Vector2.subtract(a2, a1).multiply(t))]
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
				overlap.sort((p1, p2) => (p1.x !== p2.x ? p1.x - p2.x : p1.y - p2.y))
				return overlap
			}
		}

		if (points.length > 0) {
			return points
		}

		return null
	}

	intersectCircle(other: Circle): Vector2[] | null {
		const a = this._p1
		const b = this._p2
		const center = other.pos
		const radius = other.rad

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
			const hp = Vector2.add(a, Vector2.multiply(d, t1))
			points.push(hp)
		}
		if (t2 >= 0 && t2 <= 1 && t2 !== t1) {
			const hp = Vector2.add(a, Vector2.multiply(d, t2))
			points.push(hp)
		}

		if ((aIn || bIn) && points.length === 1) {
			return [points[0]]
		}

		if (points.length > 0) {
			return points
		}

		return null
	}

	static pointIsOnSeg(p1: Vector2, p2: Vector2, point: Vector2): boolean {
		const crossProduct =
			(point.y - p1.y) * (p2.x - p1.x) - (point.x - p1.x) * (p2.y - p1.y)

		if (Math.abs(crossProduct) > EPSILON) {
			return false
		}

		return (
			point.x >= Math.min(p1.x, p2.x) &&
			point.x <= Math.max(p1.x, p2.x) &&
			point.y >= Math.min(p1.y, p2.y) &&
			point.y <= Math.max(p1.y, p2.y)
		)
	}

	static containPoint(s: Segment, p: Vector2) {
		return Segment.pointIsOnSeg(s.p1, s.p2, p)
	}

	public contain(p: Vector2): boolean {
		return Segment.pointIsOnSeg(this._p1, this._p2, p)
	}

	public distanceToPoint(point: Vector2): number {
		const closestPoint = this.closestPointToPoint(point)
		return point.dist(closestPoint)
	}

	public closestPointToPoint(point: Vector2): Vector2 {
		const segmentVector = Vector2.subtract(this._p2, this._p1)
		const segmentLengthSquared = segmentVector.squaredLength()

		if (segmentLengthSquared === 0) {
			return this._p1.clone()
		}

		const pointVector = Vector2.subtract(point, this._p1)
		const projection =
			Vector2.dot(pointVector, segmentVector) / segmentLengthSquared

		if (projection <= 0) return this._p1.clone()
		if (projection >= 1) return this._p2.clone()

		const segmentVectorClone = segmentVector.clone()
		return Vector2.add(this._p1, segmentVectorClone.multiply(projection))
	}

	public getNormal(): Vector2 {
		const dx = this._p2.x - this._p1.x
		const dy = this._p2.y - this._p1.y
		const normal = new Vector2(-dy, dx)

		return normal.normalize()
	}

	public serialize(): ArrayBuffer {
		// 32o
		const merged = new Uint8Array(32)
		merged.set(new Uint8Array(this._p1.serialize()), 0)
		merged.set(new Uint8Array(this._p2.serialize()), 16)
		return merged.buffer
	}

	clone(): Segment {
		return new Segment(this._p1.clone(), this._p2.clone())
	}

	intersectSweptCircle(
		startPos: Vector2,
		endPos: Vector2,
		radius: number
	): number | null {
		const movement = Vector2.subtract(endPos, startPos)
		const movementLength = movement.magnitude()

		if (movementLength < EPSILON) {
			const dist = this.distanceToPoint(startPos)
			return dist <= radius ? 0 : null
		}

		const steps = Math.ceil(movementLength / (radius * 0.5)) + 1
		const stepSize = 1 / steps

		for (let i = 0; i <= steps; i++) {
			const t = i * stepSize
			const pos = Vector2.add(startPos, Vector2.multiply(movement, t))
			const dist = this.distanceToPoint(pos)

			if (dist <= radius) {
				let lo = Math.max(0, (i - 1) * stepSize)
				let hi = t

				for (let j = 0; j < 8; j++) {
					const mid = (lo + hi) / 2
					const midPos = Vector2.add(startPos, Vector2.multiply(movement, mid))
					const midDist = this.distanceToPoint(midPos)

					if (midDist <= radius) {
						hi = mid
					} else {
						lo = mid
					}
				}

				return lo
			}
		}

		return null
	}
}
