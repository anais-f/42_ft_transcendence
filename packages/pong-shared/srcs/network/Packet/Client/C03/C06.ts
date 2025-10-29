import { Vector2 } from '../../../../math/Vector2.js'
import { IC00PongBase } from '../C00.js'
import { C03BallBase } from './C03.js'
import { C04BallVelo } from './C04.js'
import { C05BallPos } from './C05.js'

export class C06BallVeloPos extends C03BallBase implements IC00PongBase {
	private C05: C05BallPos
	private C04: C04BallVelo

	constructor(pos: Vector2, velo: Vector2, ts: number | null = null) {
		const C03 = ts === null ? C03BallBase.createC03() : new C03BallBase(ts)

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
		const fake = this.fserialize()
		const buff = new ArrayBuffer(41)
		const fakeUint8 = new Uint8Array(fake)
		const buffUint8 = new Uint8Array(buff)

		buffUint8.set(fakeUint8)

		buffUint8[8] |= 0b11000

		const view = new DataView(buff)
		view.setFloat64(9, this.getVelo().getX(), true)
		view.setFloat64(17, this.getVelo().getY(), true)
		view.setFloat64(25, this.getPos().getX(), true)
		view.setFloat64(33, this.getPos().getY(), true)

		return buff
	}
}
