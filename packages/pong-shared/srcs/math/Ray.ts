import { EPSILON } from '../define'
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

	intersect(other: Segment): Vector2[] | null
	intersect(other: Ray): Vector2[] | null
	intersect(other: Circle): Vector2[] | null

	intersect(other: Segment | Circle | Ray): Vector2[] | null {
		if (other instanceof Segment) {
			return this.intersectSegment(other)
		} else if (other instanceof Ray) {
			return this.intersectRay(other)
		} else if (other instanceof Circle) {
			return other.intersect(this)
		}
		throw 'Invalid type'
	}

	private intersectRay(other: Ray): Vector2[] | null {
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
			return [intersectionPoint]
		}
		return null
	}

	private intersectSegment(other: Segment): Vector2[] | null {
		const [start, end]: Vector2[] = other.getPoints()
		const segV = Vector2.subtract(end, start)
		const dir = this.getDirection()
		const crossProduct = Vector2.cross(dir, segV)

		if (Math.abs(crossProduct) < EPSILON) {
			const origin = this.getOrigin()
			const v1 = Vector2.subtract(start, origin)

			if (Math.abs(Vector2.cross(v1, dir)) < EPSILON) {
				const dirNorm = dir.normalize()
				const tStart = Vector2.dot(Vector2.subtract(start, origin), dirNorm)
				const tEnd = Vector2.dot(Vector2.subtract(end, origin), dirNorm)

				const candidates: { t: number; point: Vector2 }[] = []
				if (tStart >= 0) candidates.push({ t: tStart, point: start.clone() })
				if (tEnd >= 0) candidates.push({ t: tEnd, point: end.clone() })

				if (candidates.length === 0) return null

				candidates.sort((a, b) => a.t - b.t)
				return [candidates[0].point]
			}
			return null
		}

		const t1 =
			Vector2.subtract(start, this.getOrigin()).cross(segV) / crossProduct
		const t2 =
			Vector2.subtract(start, this.getOrigin()).cross(dir) / crossProduct

		if (t1 >= 0 && t2 >= 0 && t2 <= 1) {
			const intersectionPoint = Vector2.add(this.getOrigin(), dir.multiply(t1))
			return [intersectionPoint]
		}
		return null
	}
}
