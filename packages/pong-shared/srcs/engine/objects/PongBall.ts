import { Circle } from '../../math/shapes/Circle.js'
import { Vector2 } from '../../math/Vector2.js'
import { PongObject } from './PongObject.js'

export class PongBall {
	private ball: PongObject
	public velo: Vector2
	public constructor(size: number, velo = new Vector2()) {
		this.ball = new PongObject(new Circle(new Vector2(), size), new Vector2())
		this.velo = velo
	}

	public getPos(): Vector2 {
		return this.ball.getOrigin()
	}
	public getObj(): PongObject {
		return this.ball
	}
}
