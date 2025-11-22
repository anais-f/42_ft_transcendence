import { Segment } from './Segment.js'
import { Vector2 } from './Vector2.js'

export class Circle {
	private rad!: number
	private origin: Vector2

	constructor(origin: Vector2 = new Vector2(), rad: number) {
		this.origin = origin
		this.setRad(rad)
	}

	public getPos(): Vector2 {
		return this.origin
	}

	public getRad(): number {
		return this.rad
	}

	public setRad(rad: number): void {
		if (rad <= 0) {
			throw 'Invlalid Radius'
		}
		this.rad = rad
	}

	public setOrigin(o: Vector2) {
		this.origin = o
	}

	public intersect(other: Segment): Vector2[] | null
	public intersect(other: Circle): Vector2[] | null

	intersect(other: Segment | Circle): Vector2[] | null {
		if (other instanceof Segment) {
			return other.intersect(this)
		} else if (other instanceof Circle) {
			return this.intersectCircle(other)
		}
		throw 'Invalid type'
	}

	private intersectCircle(other: Circle): Vector2[] | null {
		let d = Vector2.subtract(other.getPos(), this.origin)
		const sqDistance = d.squaredLength()
		const radiusSum = this.rad + other.getRad()
		d.normalize()

		if (sqDistance > radiusSum ** 2) {
			return null
		}

		// weird fix
		if (sqDistance <= 0) {
			return [this.getRad() > other.getRad() ? other.getPos() : this.getPos()]
		}

		const distance = Math.sqrt(sqDistance)

		if (distance === radiusSum) {
			return [Vector2.add(this.origin, d.multiply(this.rad))]
		}

		const a =
			(this.rad ** 2 - other.getRad() ** 2 + sqDistance) / (2 * distance)
		const h = Math.sqrt(this.rad ** 2 - a ** 2)

		const p2 = Vector2.add(this.origin, d.multiply(a))

		const t1 = new Vector2(
			p2.getX() + (h * (other.getPos().getY() - this.origin.getY())) / distance,
			p2.getY() - (h * (other.getPos().getX() - this.origin.getX())) / distance
		)

		const t2 = new Vector2(
			p2.getX() - (h * (other.getPos().getY() - this.origin.getY())) / distance,
			p2.getY() + (h * (other.getPos().getX() - this.origin.getX())) / distance
		)

		// weird fix
		if (
			isNaN(t1.getX()) ||
			isNaN(t2.getX()) ||
			isNaN(t1.getY()) ||
			isNaN(t2.getY())
		) {
			return [this.getRad() > other.getRad() ? other.getPos() : this.getPos()]
		}

		return [t1, t2]
	}

	public containsPoint(point: Vector2): boolean {
		const sqDistance: number = this.getPos().squaredDist(point)
		return sqDistance <= this.getRad() ** 2
	}

	public clone(): Circle {
		return new Circle(this.getPos().clone(), this.rad)
	}

	public getNormalAt(point: Vector2): Vector2 {
		return Vector2.subtract(point, this.origin).normalize()
	}
}
