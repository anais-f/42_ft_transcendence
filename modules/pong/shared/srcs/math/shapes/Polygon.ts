import { Vector2 } from "../Vector2"
import { Circle } from "./Circle"
import { Ray } from "../Ray"
import { Segment } from "../Segment"

export class Polygon {
	private segments: Segment[] = []

	constructor(points: Vector2[]) {
		for (let i = 0; i < points.length; ++i) {
			this.segments.push(
				new Segment(
					points[i], points[(i + 1) % points.length]
				)
			)
		}
	}



	intersect(other: Circle): boolean
	intersect(other: Ray): boolean

	intersect(other: Circle | Ray): boolean {
		if (other instanceof Circle) {
			return this.intersectCircle(other)
		} else if (other instanceof Ray) {
			return this.intersectRay(other)
		}
		throw "Invalid intersect type expected: Circle | Ray"
	}

	private intersectCircle(other: Circle): boolean {
   		for (const seg of this.segments) {
			if (seg.intersect(other)) {
				return true
			}
		}
		return false
	}

	private intersectRay(other: Ray): boolean {
   		for (const seg of this.segments) {
			if (other.intersect(seg)) {
				return true
			}
		}
		return false
	}

}
