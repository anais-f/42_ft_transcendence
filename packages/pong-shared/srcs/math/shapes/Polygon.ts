import { Vector2 } from '../Vector2'
import { Circle } from './Circle'
import { Ray } from '../Ray'
import { Segment } from '../Segment'
import { Shape } from './Shape'

export class Polygon extends Shape {
	private segments: Segment[] = []
	private relativePoints: Vector2[]

	public constructor(points: Vector2[], origin: Vector2 = new Vector2()) {
		super(origin)
		this.relativePoints = points
		for (let i = 0; i < points.length; ++i) {
			this.segments.push(
				new Segment(points[i], points[(i + 1) % points.length])
			)
		}
	}

	public getAbsolutePoints(): Vector2[] {
		return this.relativePoints.map((point) => Vector2.add(point, this.origin))
	}

	public getAbsoluteSegments(): Segment[] {
		return this.segments.map(
			(seg) =>
				new Segment(
					Vector2.add(seg.getP1(), this.origin),
					Vector2.add(seg.getP2(), this.origin)
				)
		)
	}

	public intersect(other: Circle): boolean
	public intersect(other: Polygon): boolean
	public intersect(other: Ray): boolean
	public intersect(other: Segment): boolean

	public intersect(other: Circle | Ray | Polygon | Segment): boolean {
		if (other instanceof Circle) {
			return this.intersectCircle(other)
		} else if (other instanceof Ray) {
			return this.intersectRay(other)
		} else if (other instanceof Polygon) {
			return this.intersectPolygon(other)
		} else if (other instanceof Segment) {
			return this.intersectSeg(other)
		}
		throw 'Invalid intersect'
	}

	private intersectCircle(other: Circle): boolean {
		const AS = this.getAbsoluteSegments()
		for (const seg of AS) {
			if (seg.intersect(other)) {
				return true
			}
		}

		return this.containsPoint(other.getPos())
	}

	private intersectRay(other: Ray): boolean {
		const AS = this.getAbsoluteSegments()
		for (const seg of AS) {
			if (other.intersect(seg)) {
				return true
			}
		}
		return false
	}

	private intersectPolygon(other: Polygon): boolean {
		const localAbSeg = this.getAbsoluteSegments()
		const otherAbSeg = other.getAbsoluteSegments()
		for (const seg1 of localAbSeg) {
			for (const seg2 of otherAbSeg) {
				if (seg1.intersect(seg2)) {
					return true
				}
			}
		}

		if (this.containsPoint(otherAbSeg[0].getP1())) {
			return true
		}
		if (other.containsPoint(localAbSeg[0].getP1())) {
			return true
		}

		return false
	}

	public containsPoint(point: Vector2): boolean {
		let inside = false
		const points = this.relativePoints.map((p) => Vector2.add(p, this.origin))

		for (const seg of this.getAbsoluteSegments()) {
			if (seg.contain(point)) {
				return true
			}
		}

		for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
			const pi = points[i]
			const pj = points[j]

			if (
				pi.getY() > point.getY() !== pj.getY() > point.getY() &&
				point.getX() <
					((pj.getX() - pi.getX()) * (point.getY() - pi.getY())) /
						(pj.getY() - pi.getY()) +
						pi.getX()
			) {
				inside = !inside
			}
		}

		return inside
	}

	private intersectSeg(other: Segment) {
		if (
			this.containsPoint(other.getP1()) ||
			this.containsPoint(other.getP2())
		) {
			return true
		}

		for (const seg of this.getAbsoluteSegments()) {
			if (seg.intersect(other)) {
				return true
			}
		}
		return false
	}

	public getSegment(): Segment[] {
		return this.segments
	}
}
