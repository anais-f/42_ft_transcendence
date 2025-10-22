import { Vector2 } from '../../../../math/Vector2.js'
import { IC00PongBase } from '../C00.js'
import { C03BallBase } from './C03.js'
import { C04BallVelo } from './C04.js'
import { C05BallPos } from './C05.js'


export class C06BallVeloPos extends C03BallBase implements IC00PongBase {
	private C05: C05BallPos
	private C04: C04BallVelo

	constructor(pos: Vector2, velo: Vector2) {
		const C03 = C03BallBase.createC03()

		super(C03.getTime())
		this.C04 = new C04BallVelo(C03, velo)
		this.C05 = new C05BallPos(C03, pos)
	}

	getPos(): Vector2 {
		return this.C05.getPos()
	}

	getVelo(): Vector2 {
		return this.C04.getVelo()
	}

	getTime(): number {
		return this.C04.getTime()
	}

	serialize(): ArrayBuffer {
		// TODO: implement
		return new ArrayBuffer
	}
}
