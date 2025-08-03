import { Vector2 } from "../Vector2"

export class Circle {
	constructor(
		private pos: Vector2,
		private rad:number
	) {}


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
		this.rad = rad
	}
}
