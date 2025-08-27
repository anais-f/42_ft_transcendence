import { Vector2 } from '../Vector2'

export interface IShape {
	clone(): Shape
	intersect(other: Shape): boolean
	containsPoint(point: Vector2): boolean
}

export class Shape {
	protected origin: Vector2

	public constructor(origin: Vector2 = new Vector2()) {
		this.origin = origin
	}

	intersect(_other: Shape): boolean {
		throw 'unknow shape'
	}

	setOrigin(o: Vector2): void {
		this.origin = o
	}

	getOrigin(): Vector2 {
		return this.origin
	}

	getAbsoluteCoord(origin: Vector2): Vector2 {
		return Vector2.add(origin, this.getOrigin())
	}
}
