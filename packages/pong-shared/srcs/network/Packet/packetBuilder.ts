import { padDirection } from '../../engine/PongPad.js'
import { C01Move as C01 } from './Client/CPackets.js'
import { CPacketsType, SPacketsType } from './packetTypes.js'

import {
	S01ServerTickConfirmation as S01,
	AS03BaseBall as S03,
	S04BallVeloChange as S04,
	S05BallPos as S05,
	S06BallSync as S06
} from './Server/SPackets.js'

export class packetBuilder {
	private constructor() {}

	public static deserializeC(buff: ArrayBuffer): C01 | null {
		const view = new DataView(buff)
		const time = view.getFloat64(0, true)

		try {
			const type = view.getUint8(8)

			switch (type) {
				case CPacketsType.C00:
					break
				case CPacketsType.C01:
					const data = view.getUint8(9)
					const state = !!(data & 0b10)
					const dir = data & 0b01 ? padDirection.UP : padDirection.DOWN
					return new C01(state, dir, time)
				default:
					break
			}
			throw 'unknow type'
		} catch (e) {
			console.log('ignored packet: ' + e)
		}
		return null
	}

	public static deserializeS(
		buff: ArrayBuffer
	): S01 | S03 | S04 | S05 | S06 | null {
		const view = new DataView(buff)
		const time = view.getFloat64(0, true)

		try {
			const type = view.getUint8(8)

			switch (type) {
				case SPacketsType.S00:
					break
				case SPacketsType.S01:
					return new S01(time)
				case SPacketsType.S02:

					break
				case SPacketsType.S04:
					break
				case SPacketsType.S05:
					break
				case SPacketsType.S06:
					break
				default:
					break
			}
		} catch (e) {
			console.log('ignored packet: ' + e)
		}
		return null
	}
}
