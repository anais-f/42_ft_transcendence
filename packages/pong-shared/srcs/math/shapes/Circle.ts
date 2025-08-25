import { Shape } from './Shape'
import { Vector2 } from '../Vector2'
import { Segment } from '../Segment'

export class Circle extends Shape {
	private rad!: number

	constructor(origin: Vector2 = new Vector2(), rad: number) {
		super(origin)
		this.setRad(rad)
	}

	public getPos(): Vector2 {
		return this.origin
	}

	public getRad(): number {
		return this.rad
	}

	public setPos(pos: Vector2): void {
		this.origin = pos
	}

	public setRad(rad: number): void {
		if (rad <= 0) throw 'invalid Radius'
		this.rad = rad
	}

	public intersect(other: Segment): boolean
	public intersect(other: Circle): boolean
	public intersect(other: Segment | Circle): boolean {
		if (other instanceof Segment) {
			return other.intersect(this)
		} else if (other instanceof Circle) {
			return this.intersectCircle(other)
		} else {
			throw 'invalid Type'
		}
	}

	private intersectCircle(other: Circle): boolean {
		const sqDistance = this.origin.squaredDist(other.getPos())
		return sqDistance <= (this.rad + other.getRad()) ** 2
	}
}
