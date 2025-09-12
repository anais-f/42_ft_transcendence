import { Vector2 } from '../Vector2'

export abstract class AShape {
	protected origin: Vector2

	protected constructor(origin: Vector2 = new Vector2()) {
		this.origin = origin
	}

	abstract intersect(_other: AShape): Vector2[] | null
	abstract containsPoint(point: Vector2): boolean
	abstract clone(): AShape
	abstract getNormalAt(point: Vector2): Vector2

	protected setOrigin(o: Vector2): void {
		this.origin = o
	}

	protected addToOrigin(v: Vector2): void {
		this.origin.add(v)
	}

	protected getOrigin(): Vector2 {
		return this.origin
	}

	protected getAbsoluteCoord(origin: Vector2): Vector2 {
		return Vector2.add(origin, this.getOrigin())
	}
}
