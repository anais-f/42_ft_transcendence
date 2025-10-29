import { Vector2 } from '@packages/pong-shared/srcs/math/Vector2.js'
import { IS00PongBase } from '../S00.js'
import { S03BaseBall } from './S03.js'

export class S04BallVeloChange extends S03BaseBall implements IS00PongBase {
	private velo: Vector2

	constructor(S03: S03BaseBall, velo: Vector2) {
		super(S03.getTime())
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
