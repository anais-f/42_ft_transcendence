import { Vector2 } from '../../../../math/Vector2.js'
import { IC00PongBase } from '../C00.js'
import { C03BallBase } from './C03.js'

export class C04BallVelo extends C03BallBase implements IC00PongBase {
	private velo: Vector2

	constructor(C03: C03BallBase, velo: Vector2) {
		super(C03.getTime())
		this.velo = velo
	}

	getVelo(): Vector2 {
		return this.velo
	}

	serialize(): ArrayBuffer {
		// TODO: implement
		return new ArrayBuffer
	}
}
