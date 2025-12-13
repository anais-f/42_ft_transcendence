import { padDirection } from '../../engine/PongPad.js'
import { Segment } from '../../math/Segment.js'
import { Vector2 } from '../../math/Vector2.js'
import { C01Move as C01 } from './Client/CPackets.js'
import { CPacketsType, SPacketsType } from './packetTypes.js'
import { S02SegmentUpdate } from './Server/S02.js'

import {
	S01ServerTickConfirmation as S01,
	AS03BaseBall as S03,
	S04BallVeloChange as S04,
	S05BallPos as S05,
	S06BallSync as S06,
	S07Score as S07,
	S08Countdown as S08
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
	): S01 | S03 | S04 | S05 | S06 | S07 | S08 | null {
		const view = new DataView(buff)
		const time = view.getFloat64(0, true)
		let velo: Vector2
		let pos: Vector2
		let factor: number

		try {
			const type = view.getUint8(8)

			switch (type) {
				case SPacketsType.S00:
					break
				case SPacketsType.S01:
					return new S01(time)
				case SPacketsType.S02:
					const nbseg = view.getUint8(9)
					const tab: Segment[] = []
					for (let i = 0; i < nbseg; ++i) {
						const offset = 10 + i * 32
						tab.push(
							new Segment(
								new Vector2(
									view.getFloat64(offset, true),
									view.getFloat64(offset + 8, true)
								),
								new Vector2(
									view.getFloat64(offset + 16, true),
									view.getFloat64(offset + 24, true)
								)
							)
						)
					}
					return new S02SegmentUpdate(time, tab)
				case SPacketsType.S03:
					return new S03(time)
				case SPacketsType.S04:
					velo = new Vector2(
						view.getFloat64(9, true),
						view.getFloat64(17, true)
					)
					factor = view.getFloat64(25, true)
					return new S04(new S03(time), velo, factor)
				case SPacketsType.S05:
					pos = new Vector2(view.getFloat64(9, true), view.getFloat64(17, true))
					return new S05(new S03(time), pos)
				case SPacketsType.S06:
					velo = new Vector2(
						view.getFloat64(9, true),
						view.getFloat64(17, true)
					)
					factor = view.getFloat64(25, true)
					pos = new Vector2(
						view.getFloat64(33, true),
						view.getFloat64(41, true)
					)
					return new S06(pos, factor, velo, time)
				case SPacketsType.S07:
					return new S07(time, view.getUint8(9), view.getUint8(10))
				case SPacketsType.S08:
					return new S08(time, view.getUint8(9))
				default:
					break
			}
		} catch (e) {
			console.log('ignored packet: ' + e)
		}
		return null
	}
}
