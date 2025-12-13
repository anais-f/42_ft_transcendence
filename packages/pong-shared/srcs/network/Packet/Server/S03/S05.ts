import { Vector2 } from '@packages/pong-shared/srcs/math/Vector2.js'
import { SPacketsType } from '../../packetTypes.js'
import { IS00PongBase } from '../S00.js'
import { AS03BaseBall } from './S03.js'

export class S05BallPos extends AS03BaseBall implements IS00PongBase {
	private _pos: Vector2

	constructor(S03: AS03BaseBall, pos: Vector2) {
		super()
		this._pos = pos
	}

	get pos(): Vector2 {
		return this._pos
	}

	serialize(): ArrayBuffer {
		const fake = this.fserialize()
		const buff = new ArrayBuffer(17)
		const fakeUint8 = new Uint8Array(fake)
		const buffUint8 = new Uint8Array(buff)

		buffUint8.set(fakeUint8)

		buffUint8[0] |= SPacketsType.S05

		const view = new DataView(buff)
		view.setFloat64(1, this._pos.x, true)
		view.setFloat64(9, this._pos.y, true)

		return buff
	}
}
