import { Circle } from '../../math/shapes/Circle.js'
import { Vector2 } from '../../math/Vector2.js'
import { PongObject } from './PongObject.js'

export class PongBall {
	private ball: PongObject
	public constructor(
		size: number,
		public velo: Vector2 = new Vector2()
	) {
		this.ball = new PongObject(new Circle(new Vector2(), size), new Vector2())
	}

	public getPos(): Vector2 {
		return this.ball.getOrigin()
	}
	public getObj(): PongObject {
		return this.ball
	}
}
