import { Vector2 } from '@packages/pong-shared/srcs/math/Vector2.js'
import { NETWORK_PRECISION } from '../../../../config.js'
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

	/*
	 * trame
	 *
	 * type 1o (uint8)
	 * pos.x 2o (int16 * NETWORK_PRECISION)
	 * pos.y 2o (int16 * NETWORK_PRECISION)
	 * total: 5o
	 */
	serialize(): ArrayBuffer {
		const buff = new ArrayBuffer(5)
		const view = new DataView(buff)

		view.setUint8(0, SPacketsType.S05)
		view.setInt16(1, Math.round(this._pos.x * NETWORK_PRECISION), true)
		view.setInt16(3, Math.round(this._pos.y * NETWORK_PRECISION), true)

		return buff
	}
}
