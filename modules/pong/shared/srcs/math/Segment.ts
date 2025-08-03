import { Vector2 } from "./Vector2"
import { Circle } from "./shapes/Circle"

export class Segment {
	constructor(
		private p1: Vector2,
		private p2: Vector2
	){}

	getPoints(): Vector2[] {
		return [this.p1, this.p2]
	}

	intersect(other: Circle): boolean
	intersect(other: Circle): boolean {
		if (other instanceof Circle) {
			return this.intersectCircle(other)
		} else {
			throw "invalid Type in segment intersect"
		}
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
}
