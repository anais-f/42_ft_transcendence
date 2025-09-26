import { Vector2 } from '../Vector2'

export class Shape {
	protected origin: Vector2

	public constructor(origin: Vector2 = new Vector2()) {
		this.origin = origin
	}

	intersect(_other: Shape): boolean {
		throw 'unknow shape'
	}

	getOrigin(): Vector2 {
		return this.origin
	}

	getAbsoluteCoord(origin: Vector2): Vector2 {
		return Vector2.add(origin, this.getOrigin())
	}
}
