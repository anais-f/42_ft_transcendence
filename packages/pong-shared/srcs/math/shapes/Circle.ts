import { Segment } from '../Segment'
import { Vector2 } from '../Vector2'
import { Shape } from './Shape'

export class Circle extends Shape {
	private rad!: number

	constructor(
		private pos: Vector2,
		rad: number
	) {
		super()
		this.setRad(rad)
	}

	getPos(): Vector2 {
		return this.pos
	}
	getRad(): number {
		return this.rad
	}

	setPos(pos: Vector2): void {
		this.pos = pos
	}

	setRad(rad: number): void {
		if (rad <= 0) {
			throw 'invlalid Radius'
		}
		this.rad = rad
	}

	intersect(other: Segment): boolean
	intersect(other: Circle): boolean
	intersect(other: Segment | Circle): boolean {
		if (other instanceof Segment) {
			return other.intersect(this)
		} else if (other instanceof Circle) {
			return this.intersectCircle(other)
		} else {
			throw 'invalid Type in circle intersect'
		}
	}

	private intersectCircle(other: Circle): boolean {
		const sqDistance: number = this.getPos().squaredDist(other.getPos())
		return sqDistance <= (this.getRad() + other.getRad()) ** 2
	}
}
