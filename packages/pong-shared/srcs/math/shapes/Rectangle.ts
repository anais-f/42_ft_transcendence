import { Vector2 } from '../Vector2'
import { Polygon } from './Polygon'

export class Rectangle extends Polygon {
	constructor(origin: Vector2, dimensions: Vector2) {
		const topRight = new Vector2(
			origin.getX() + dimensions.getX(),
			origin.getY()
		)
		const bottomLeft = new Vector2(
			origin.getX(),
			origin.getY() + dimensions.getY()
		)
		const bottomRight = new Vector2(
			origin.getX() + dimensions.getX(),
			origin.getY() + dimensions.getY()
		)

		super([origin, topRight, bottomRight, bottomLeft])
	}

	public getMinX() {
		return this.getSegment()[0].getP1().getX()
	}

	public getMinY() {
		return this.getSegment()[0].getP1().getY()
	}

	public getMaxX() {
		return this.getSegment()[1].getP1().getX()
	}

	public getMaxY() {
		return this.getSegment()[2].getP1().getY()
	}
}
