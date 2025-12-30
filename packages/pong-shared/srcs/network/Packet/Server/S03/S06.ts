import { Vector2 } from '@packages/pong-shared/srcs/math/Vector2.js'
import { NETWORK_PRECISION } from '../../../../config.js'
import { IS00PongBase } from '../S00.js'
import { SPacketsType } from '../../packetTypes.js'
import { AS03BaseBall } from './S03.js'

export class S06BallSync extends AS03BaseBall implements IS00PongBase {
	private _pos: Vector2
	private _velo: Vector2
	private _factor: number

	constructor(pos: Vector2, factor: number, velo: Vector2) {
		super()
		this._pos = pos
		this._velo = velo
		this._factor = factor
	}

	get pos(): Vector2 {
		return this._pos
	}

	get velo(): Vector2 {
		return this._velo
	}

	get factor(): number {
		return this._factor
	}

	/*
	 * trame
	 *
	 * type 1o (uint8)
	 * velo.x 2o (int16 * NETWORK_PRECISION)
	 * velo.y 2o (int16 * NETWORK_PRECISION)
	 * factor 2o (int16 * NETWORK_PRECISION)
	 * pos.x 2o (int16 * NETWORK_PRECISION)
	 * pos.y 2o (int16 * NETWORK_PRECISION)
	 * total: 11o
	 */
	serialize(): ArrayBuffer {
		const buff = new ArrayBuffer(11)
		const view = new DataView(buff)

		view.setUint8(0, SPacketsType.S06)
		view.setInt16(1, Math.round(this._velo.x * NETWORK_PRECISION), true)
		view.setInt16(3, Math.round(this._velo.y * NETWORK_PRECISION), true)
		view.setInt16(5, Math.round(this._factor * NETWORK_PRECISION), true)
		view.setInt16(7, Math.round(this._pos.x * NETWORK_PRECISION), true)
		view.setInt16(9, Math.round(this._pos.y * NETWORK_PRECISION), true)

		return buff
	}
}
