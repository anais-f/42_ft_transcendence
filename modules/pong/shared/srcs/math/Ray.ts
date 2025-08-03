import { Segment } from "./Segment"
import { Vector2 } from "./Vector2"

export class Ray {
	constructor(
		private origin: Vector2,
		private direction: Vector2
	) {}

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
		return new Ray(
			p1,
			Vector2.subtract(p2, p1).normalize()
		)
	}

	intersect(other: Segment): boolean
	intersect(other: Segment): boolean {
		if (other instanceof Segment) {
			return this.intersectSegment(other)
		} else {
			throw "Invalid intersect type expected: Segment"
		}
	}

	private intersectSegment(other: Segment): boolean {
		const origin = this.getOrigin()
		const direction = this.getDirection()
		const p1 = other.getPoints()[0]
		const p2 = other.getPoints()[1]

		const r = Vector2.subtract(p2, p1)
		const q = Vector2.subtract(origin, p1)

		const rCrossD = r.cross(direction)
		const qCrossR = q.cross(r)
		const qCrossD = q.cross(direction)

		if (rCrossD === 0) {
			// Lines are parallel
			return false
		}

		const t = qCrossR / rCrossD
		const u = qCrossD / rCrossD

		return (t >= 0 && u >= 0 && u <= 1)
	}
}
