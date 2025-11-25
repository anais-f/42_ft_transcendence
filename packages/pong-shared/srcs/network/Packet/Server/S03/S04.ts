import { Vector2 } from '@packages/pong-shared/srcs/math/Vector2.js'
import { SPacketsType } from '../../packetTypes.js'
import { IS00PongBase } from '../S00.js'
import { AS03BaseBall } from './S03.js'

export class S04BallVeloChange extends AS03BaseBall implements IS00PongBase {
	constructor(
		S03: AS03BaseBall,
		private velo: Vector2,
		private factor: number
	) {
		super(S03.getTime())
	}

	getVelo(): Vector2 {
		return this.velo
	}

	getFactor(): number {
		return this.factor
	}

	serialize(): ArrayBuffer {
		const fake = this.fserialize()
		const buff = new ArrayBuffer(33)
		const fakeUint8 = new Uint8Array(fake)
		const buffUint8 = new Uint8Array(buff)

		buffUint8.set(fakeUint8)

		buffUint8[8] |= SPacketsType.S04

		const view = new DataView(buff)
		view.setFloat64(9, this.velo.getX(), true)
		view.setFloat64(17, this.velo.getY(), true)
		view.setFloat64(25, this.factor, true)

		return buff
	}
}
