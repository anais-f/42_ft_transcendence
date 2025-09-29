import { Vector2 } from '../Vector2'
import { Circle } from './Circle'
import { Ray } from '../Ray'
import { Segment } from '../Segment'
import { AShape } from './AShape'

export class Polygon extends AShape {
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

	public intersect(other: Circle): Vector2[] | null
	public intersect(other: Polygon): Vector2[] | null
	public intersect(other: Ray): Vector2[] | null
	public intersect(other: Segment): Vector2[] | null

	public intersect(other: Circle | Ray | Polygon | Segment): Vector2[] | null {
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

	private intersectCircle(other: Circle): Vector2[] | null {
		const AS = this.getAbsoluteSegments()
		let hps: Vector2[] = []
		for (const seg of AS) {
			const hp = seg.intersect(other)
			if (Array.isArray(hp)) {
				hps = [...hps, ...hp]
			}
		}
		if (hps.length !== 0) {
			return hps
		}

		if (this.containsPoint(other.getPos())) {
			return [other.getPos()]
		}
		return null
	}

	private intersectRay(other: Ray): Vector2[] | null {
		const AS = this.getAbsoluteSegments()
		let hps: Vector2[] = []

		for (const seg of AS) {
			let hp: Vector2[] | null = other.intersect(seg)
			if (Array.isArray(hp)) {
				hps.push(hp[0])
			}
		}

		if (hps.length === 0) {
			return null
		}
		return hps
	}

	private intersectPolygon(other: Polygon): Vector2[] | null {
		const localAbSeg = this.getAbsoluteSegments()
		const otherAbSeg = other.getAbsoluteSegments()

		let res: Vector2[] = []
		for (const seg1 of localAbSeg) {
			for (const seg2 of otherAbSeg) {
				const t: Vector2[] | null = seg1.intersect(seg2)
				if (Array.isArray(t)) {
					res = [...res, ...t]
				}
			}
		}
		if (res.length !== 0) {
			return res
		}
		if (this.containsPoint(otherAbSeg[0].getP1())) {
			res.push(otherAbSeg[0].getP1())
		}
		if (other.containsPoint(localAbSeg[0].getP1())) {
			res.push(localAbSeg[0].getP1())
		}

		if (res.length === 0) {
			return null
		}
		return res
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

	private intersectSeg(other: Segment): Vector2[] | null {
		let hps: Vector2[] = []
		if (this.containsPoint(other.getP1())) {
			hps.push(other.getP1())
		}
		if (this.containsPoint(other.getP2())) {
			hps.push(other.getP2())
		}

		for (const seg of this.getAbsoluteSegments()) {
			const hp = seg.intersect(other)
			if (Array.isArray(hp)) {
				hps = [...hps, ...hp]
			}
		}
		if (hps.length === 0) {
			return null
		}
		return hps
	}

	public getSegment(): Segment[] {
		return this.segments
	}

	public clone(): Polygon {
		const points = this.segments.map((seg) => seg.getP1().clone())
		return new Polygon(points, this.origin)
	}

	private getCentroid(): Vector2 {
		const vertices = this.getAbsolutePoints()
		const xSum = vertices.reduce((sum, v) => sum + v.getX(), 0)
		const ySum = vertices.reduce((sum, v) => sum + v.getY(), 0)
		const count = vertices.length
		return new Vector2(xSum / count, ySum / count)
	}

	public getNormalAt(point: Vector2): Vector2 {
		const segments = this.getAbsoluteSegments()

		let minDist = Infinity
		let closestSeg: Segment | null = null

		for (const seg of segments) {
			const dist = seg.distanceToPoint(point)
			if (dist < minDist) {
				minDist = dist
				closestSeg = seg
			}
		}

		if (!closestSeg) {
			throw new Error('No segment found for normal calculation')
		}

		let normal = closestSeg.getNormal()

		const centroid = this.getCentroid()
		const dirToCentroid = Vector2.subtract(centroid, point)

		if (Vector2.dot(normal, dirToCentroid) > 0) {
			normal.negate()
		}

		return normal.normalize()
	}
}
