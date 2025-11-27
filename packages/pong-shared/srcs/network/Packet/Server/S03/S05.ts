import { Vector2 } from '@packages/pong-shared/srcs/math/Vector2.js'
import { SPacketsType } from '../../packetTypes.js'
import { IS00PongBase } from '../S00.js'
import { AS03BaseBall } from './S03.js'

export class S05BallPos extends AS03BaseBall implements IS00PongBase {
	private pos: Vector2

	constructor(S03: AS03BaseBall, pos: Vector2) {
		super(S03.getTime())
		this.pos = pos
	}

	getPos(): Vector2 {
		return this.pos
	}

	serialize(): ArrayBuffer {
		const fake = this.fserialize()
		const buff = new ArrayBuffer(25)
		const fakeUint8 = new Uint8Array(fake)
		const buffUint8 = new Uint8Array(buff)

		buffUint8.set(fakeUint8)

		buffUint8[8] |= SPacketsType.S05

		const view = new DataView(buff)
		view.setFloat64(9, this.pos.getX(), true)
		view.setFloat64(17, this.pos.getY(), true)

		return buff
	}
}
