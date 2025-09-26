import { Vector2 } from '../Vector2'
import { Polygon } from './Polygon'

export class Rectangle extends Polygon {
	private width: number
	private height: number

	constructor(origin: Vector2, dimensions: Vector2) {
		const w = dimensions.getX()
		const h = dimensions.getY()
		super(
			[
				new Vector2(0, 0),
				new Vector2(w, 0),
				new Vector2(w, h),
				new Vector2(0, h),
			],
			origin
		)
		this.width = w
		this.height = h
	}

	public getOrigin(): Vector2 {
		return super.getOrigin()
	}

	public getWidth(): number {
		return this.width
	}

	public getHeight(): number {
		return this.height
	}
}
