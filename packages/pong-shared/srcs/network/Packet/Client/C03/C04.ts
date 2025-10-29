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
		const fake = this.fserialize()
		const buff = new ArrayBuffer(25)
		const fakeUint8 = new Uint8Array(fake)
		const buffUint8 = new Uint8Array(buff)

		buffUint8.set(fakeUint8)

		buffUint8[8] |= 0b1000

		const view = new DataView(buff)
		view.setFloat64(9, this.velo.getX(), true)
		view.setFloat64(17, this.velo.getY(), true)

		return buff
	}
}
