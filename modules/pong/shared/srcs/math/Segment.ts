import { Vector2 } from "./Vector2"
import { Circle } from "./shapes/Circle"
import { Polygon } from "./shapes/Polygon"

export class Segment {
	constructor(
		private p1: Vector2,
		private p2: Vector2
	){}

	getPoints(): Vector2[] {
		return [this.p1, this.p2]
	}

	getP1() { return this.p1 }
	getP2() { return this.p2 }

	intersect(other: Circle): boolean
	intersect(other: Segment): boolean
	intersect(other: Polygon): boolean
	intersect(other: Circle | Segment | Polygon): boolean {
		if (other instanceof Circle) {
			return this.intersectCircle(other)
		} else if (other instanceof Segment) {
			return this.intersectSeg(other)
		} else if (other instanceof Polygon) {
			return other.intersect(this)
		}
		throw "invalid Type in segment intersect"
		
	}

	private intersectSeg(other: Segment): boolean {
		function direction(p: Vector2, q: Vector2, r:Vector2): number {
			return Vector2.cross(Vector2.subtract(q, p), Vector2.subtract(r, p))
		}

		const [p3, p4] = other.getPoints()

		const d1 = direction(p3, p4, this.p1)
		const d2 = direction(p3, p4, this.p2)
		const d3 = direction(this.p1, this.p2, p3)
		const d4 = direction(this.p1, this.p2, p4)

		if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
			((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
			return true
		}

		if (d1 === 0 && Segment.pointIsOnSeg(p3, p4, this.p1)) return true
		if (d2 === 0 && Segment.pointIsOnSeg(p3, p4, this.p2)) return true
		if (d3 === 0 && Segment.pointIsOnSeg(this.p1, this.p2, p3)) return true
		if (d4 === 0 && Segment.pointIsOnSeg(this.p1, this.p2, p4)) return true

		return false

	}

	private intersectCircle(other: Circle): boolean {
		const segVector = Vector2.subtract(this.p2, this.p1)
		const segLengthSq = segVector.squaredLength()

		const p1ToCircle = Vector2.subtract(other.getPos(), this.p1)
		const t = Math.max(0, Math.min(1, Vector2.dot(p1ToCircle, segVector) / segLengthSq))

		const closestP = Vector2.add(this.p1, segVector.multiply(t))

		const distToCircle = Vector2.subtract(closestP, other.getPos()).magnitude()

		return distToCircle <= other.getRad()
	}

	static pointIsOnSeg(p1: Vector2, p2: Vector2, point: Vector2): boolean {
		const crossProduct = (point.getY() - p1.getY()) * (p2.getX() - p1.getX()) -
							 (point.getX() - p1.getX()) * (p2.getY() - p1.getY());
		
		if (Math.abs(crossProduct) > Number.EPSILON) {
			return false;
		}
		
		return point.getX() >= Math.min(p1.getX(), p2.getX()) &&
			   point.getX() <= Math.max(p1.getX(), p2.getX()) &&
			   point.getY() >= Math.min(p1.getY(), p2.getY()) &&
			   point.getY() <= Math.max(p1.getY(), p2.getY());

	}

	static containPoint(s: Segment, p: Vector2) {
		return Segment.pointIsOnSeg(s.getP1(), s.getP2(), p)
	}
	
	contain(p: Vector2): boolean {
		return Segment.pointIsOnSeg(this.p1, this.p2, p)
	}

}
