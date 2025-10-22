import { Vector2 } from "../../../../math/Vector2.js"
import { C03BallBase } from './C03.js'
import { IC00PongBase } from '../C00.js'

export class C05BallPos extends C03BallBase implements IC00PongBase {
	private pos: Vector2

	constructor(C03: C03BallBase, pos: Vector2) {
		super(C03.getTime())
		this.pos = pos
	}

	getPos(): Vector2 {
		return this.pos
	}

	serialize(): ArrayBuffer {
		// TODO: implement
		return new ArrayBuffer
	}
}
