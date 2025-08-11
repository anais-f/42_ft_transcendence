import { Vector2 } from "../Vector2"
import { Circle } from "./Circle"
import { Ray } from "../Ray"
import { Segment } from "../Segment"
import { Shape } from "./Shape"

export class Polygon extends Shape {
	private segments: Segment[] = []

	constructor(points: Vector2[]) {
		super()
		for (let i = 0; i < points.length; ++i) {
			this.segments.push(
				new Segment(
					points[i], points[(i + 1) % points.length]
				)
			)
		}
	}

	intersect(other: Circle): boolean
	intersect(other: Polygon): boolean
	intersect(other: Ray): boolean
	intersect(other: Segment): boolean

	intersect(other: Circle | Ray | Polygon | Segment): boolean {
		if (other instanceof Circle) {
			return this.intersectCircle(other)
		} else if (other instanceof Ray) {
			return this.intersectRay(other)
		} else if (other instanceof Polygon) {
			return this.intersectPolygon(other)
		} else if (other instanceof Segment) {
			return this.intersectSeg(other)
		}
		throw "Invalid intersect"
	}

	private intersectCircle(other: Circle): boolean {
		for (const seg of this.segments) {
			if (seg.intersect(other)) {
				return true
			}
		}
		
		return this.containsPoint(other.getPos())
	}

	private intersectRay(other: Ray): boolean {
		for (const seg of this.segments) {
			if (other.intersect(seg)) {
				return true
			}
		}
		return false
	}

	private intersectPolygon(other: Polygon): boolean {
		
		for (const seg1 of this.segments) {
			for (const seg2 of other.segments) {
				if (seg1.intersect(seg2)) {
					return true
				}
			}
		}

		
		if (this.containsPoint(other.segments[0].getP1())) {
			return true
		}
		if (other.containsPoint(this.segments[0].getP1())) {
			return true
		}

		return false
	}

	public containsPoint(point: Vector2): boolean {
		let inside = false;
		const points: Vector2[] = this.segments.map((e) => e.getP1());
		
		for (const seg of this.segments) {
			if (seg.contain(point)) {
				return true;
			}
		}

		for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
			const pi = points[i];
			const pj = points[j];

			if (((pi.getY() > point.getY()) !== (pj.getY() > point.getY())) &&
				(point.getX() < (pj.getX() - pi.getX()) * (point.getY() - pi.getY()) /
				 (pj.getY() - pi.getY()) + pi.getX())) {
				inside = !inside;
			}
		}

		return inside;
	}

	private intersectSeg(other: Segment) {
		if (this.containsPoint(other.getP1()) || this.containsPoint(other.getP2())) {
			return true
		}

		for (const seg of this.segments) {
			if (seg.intersect(other)) {
				return true;
			}
		}
		return false
	}

	public getSegment(): Segment[] {
		return this.segments
	}
}
