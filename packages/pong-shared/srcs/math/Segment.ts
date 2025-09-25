import { EPSILON } from '../define'
import { Ray } from './Ray'
import { Vector2 } from './Vector2'
import { Circle } from './shapes/Circle'
import { Polygon } from './shapes/Polygon'

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
		function direction(p: Vector2, q: Vector2, r: Vector2): number {
			return Vector2.cross(Vector2.subtract(q, p), Vector2.subtract(r, p))
		}
		const [p3, p4] = other.getPoints()

		const d1 = direction(p3, p4, this.p1)
		const d2 = direction(p3, p4, this.p2)
		const d3 = direction(this.p1, this.p2, p3)
		const d4 = direction(this.p1, this.p2, p4)

		if (
			((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
			((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
		) {
			const t = d1 / (d1 - d2)
			const intersectionPoint = Vector2.add(
				this.p1,
				Vector2.subtract(this.p2, this.p1).multiply(t)
			)
			return [intersectionPoint]
		}

		if (
			(d1 === 0 && Segment.pointIsOnSeg(p3, p4, this.p1)) ||
			(d2 === 0 && Segment.pointIsOnSeg(p3, p4, this.p2)) ||
			(d3 === 0 && Segment.pointIsOnSeg(this.p1, this.p2, p3)) ||
			(d4 === 0 && Segment.pointIsOnSeg(this.p1, this.p2, p4))
		) {
			const points = [this.p1, this.p2, p3, p4]

			points.sort((a, b) =>
				a.getX() !== b.getX() ? a.getX() - b.getX() : a.getY() - b.getY()
			)

			const overlapStart = points[1]

			return [overlapStart] // or [(overlapStart + overlapEnd [point2]) / 2]
		}

		return null
	}

	private intersectCircle(other: Circle): Vector2[] | null {
		const segVector = Vector2.subtract(this.p2, this.p1)
		const segLengthSq = segVector.squaredLength()

		const p1ToCircle = Vector2.subtract(other.getPos(), this.p1)
		const t = Math.max(
			0,
			Math.min(1, Vector2.dot(p1ToCircle, segVector) / segLengthSq)
		)

		const closestP = Vector2.add(this.p1, Vector2.multiply(segVector, t))
		const distToCircle = Vector2.subtract(closestP, other.getPos()).magnitude()

		if (distToCircle <= other.getRad()) {
			const d = Math.sqrt(other.getRad() ** 2 - distToCircle ** 2)
			const direction = Vector2.normalize(segVector)

			const t1 = Vector2.add(closestP, Vector2.multiply(direction, d))
			const t2 = Vector2.subtract(closestP, Vector2.multiply(direction, d))
			if (t1.equals(t2)) return [t1]

			return [t1, t2]
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
}
