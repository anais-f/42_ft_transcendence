import { Segment } from './Segment.js'
import { Vector2 } from './Vector2.js'

export class Circle {
	private _rad!: number
	private _origin: Vector2

	constructor(origin: Vector2 = new Vector2(), rad: number) {
		this._origin = origin
		this.rad = rad
	}

	get pos(): Vector2 {
		return this._origin
	}

	get rad(): number {
		return this._rad
	}

	set rad(rad: number) {
		if (rad <= 0) {
			throw 'Invlalid Radius'
		}
		this._rad = rad
	}

	set origin(o: Vector2) {
		this._origin = o
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
		let d = Vector2.subtract(other.pos, this._origin)
		const sqDistance = d.squaredLength()
		const radiusSum = this._rad + other.rad
		d.normalize()

		if (sqDistance > radiusSum ** 2) {
			return null
		}

		if (sqDistance <= 0) {
			return [this._rad > other.rad ? other.pos : this.pos]
		}

		const distance = Math.sqrt(sqDistance)

		if (distance === radiusSum) {
			return [Vector2.add(this._origin, d.multiply(this._rad))]
		}

		const a = (this._rad ** 2 - other.rad ** 2 + sqDistance) / (2 * distance)
		const h = Math.sqrt(this._rad ** 2 - a ** 2)

		const p2 = Vector2.add(this._origin, d.multiply(a))

		const t1 = new Vector2(
			p2.x + (h * (other.pos.y - this._origin.y)) / distance,
			p2.y - (h * (other.pos.x - this._origin.x)) / distance
		)

		const t2 = new Vector2(
			p2.x - (h * (other.pos.y - this._origin.y)) / distance,
			p2.y + (h * (other.pos.x - this._origin.x)) / distance
		)

		if (isNaN(t1.x) || isNaN(t2.x) || isNaN(t1.y) || isNaN(t2.y)) {
			return [this._rad > other.rad ? other.pos : this.pos]
		}

		return [t1, t2]
	}

	public containsPoint(point: Vector2): boolean {
		const sqDistance: number = this.pos.squaredDist(point)
		return sqDistance <= this._rad ** 2
	}

	public clone(): Circle {
		return new Circle(this.pos.clone(), this._rad)
	}

	public getNormalAt(point: Vector2): Vector2 {
		return Vector2.subtract(point, this._origin).normalize()
	}
}
