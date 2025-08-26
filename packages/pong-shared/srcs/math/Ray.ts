import { Segment } from './Segment'
import { Circle } from './shapes/Circle'
import { Vector2 } from './Vector2'

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

	intersect(other: Segment): boolean
	intersect(other: Ray): boolean
	intersect(other: Circle): boolean

	intersect(other: Segment | Circle | Ray): boolean {
		if (other instanceof Segment) {
			return this.intersectSegment(other)
		} else if (other instanceof Ray) {
			return this.intersectRay(other)
		} else if (other instanceof Circle) {
			return other.intersect(this)
		}
		throw 'Invalid type'
	}

	private intersectRay(other: Ray): boolean {
		const crossProduct = this.getDirection().cross(other.getDirection())

		if (Math.abs(crossProduct) < Number.EPSILON) {
			return false
		}

		const t1 =
			Vector2.subtract(other.getOrigin(), this.getOrigin()).cross(
				other.getDirection()
			) / crossProduct
		const t2 =
			Vector2.subtract(other.getOrigin(), this.getOrigin()).cross(
				this.getDirection()
			) / crossProduct

		return t1 >= 0 && t2 >= 0
	}

	private intersectSegment(other: Segment): boolean {
		const [start, end]: Vector2[] = other.getPoints()
		const segV = Vector2.subtract(end, start)

		const crossProduct = this.getDirection().cross(segV)

		if (Math.abs(crossProduct) < Number.EPSILON) {
			const v1 = Vector2.subtract(start, this.getOrigin())
			if (Math.abs(v1.cross(this.getDirection())) < Number.EPSILON) {
				const t0 =
					Vector2.dot(v1, this.getDirection()) /
					this.getDirection().squaredLength()
				return t0 >= 0
			}
			return false
		}

		const t1 =
			Vector2.subtract(start, this.getOrigin()).cross(segV) / crossProduct
		const t2 =
			Vector2.subtract(start, this.getOrigin()).cross(this.getDirection()) /
			crossProduct

		return t1 >= 0 && t2 >= 0 && t2 <= 1
	}
}
