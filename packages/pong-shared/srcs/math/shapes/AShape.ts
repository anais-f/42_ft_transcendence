import { Vector2 } from '../Vector2'

export abstract class AShape {
	protected origin: Vector2

	public constructor(origin: Vector2 = new Vector2()) {
		this.origin = origin
	}

	abstract intersect(_other: AShape): boolean
	abstract containsPoint(point: Vector2): boolean
	abstract clone(): AShape

	setOrigin(o: Vector2): void {
		this.origin = o
	}

	addToOrigin(v: Vector2): void {
		this.origin.add(v)
	}

	getOrigin(): Vector2 {
		return this.origin
	}

	getAbsoluteCoord(origin: Vector2): Vector2 {
		return Vector2.add(origin, this.getOrigin())
	}
}
