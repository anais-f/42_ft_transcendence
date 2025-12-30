import { padDirection } from '../../engine/PongPad.js'
import { Segment } from '../../math/Segment.js'
import { Vector2 } from '../../math/Vector2.js'
import { NETWORK_PRECISION } from '../../config.js'
import { C01Move as C01, C02RequestScore as C02 } from './Client/CPackets.js'
import { CPacketsType, SPacketsType } from './packetTypes.js'
import { S02SegmentUpdate } from './Server/S02.js'
import { S09DynamicSegments } from './Server/S09.js'

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

	public static deserializeC(buff: ArrayBuffer): C01 | C02 | null {
		const view = new DataView(buff)

		try {
			const type = view.getUint8(0)

			switch (type) {
				case CPacketsType.C00:
					break
				case CPacketsType.C01:
					const data = view.getUint8(1)
					const state = !!(data & 0b10)
					const dir = data & 0b01 ? padDirection.UP : padDirection.DOWN
					return new C01(state, dir)
				case CPacketsType.C02:
					return new C02()
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
	): S01 | S03 | S04 | S05 | S06 | S07 | S08 | S09DynamicSegments | null {
		const view = new DataView(buff)
		let velo: Vector2
		let pos: Vector2
		let factor: number

		try {
			const type = view.getUint8(0)

			switch (type) {
				case SPacketsType.S00:
					break
				case SPacketsType.S01:
					return new S01()
				case SPacketsType.S02:
					const nbseg = view.getUint8(1)
					const tab: Segment[] = []
					for (let i = 0; i < nbseg; ++i) {
						const offset = 2 + i * 8
						tab.push(
							new Segment(
								new Vector2(
									view.getInt16(offset, true) / NETWORK_PRECISION,
									view.getInt16(offset + 2, true) / NETWORK_PRECISION
								),
								new Vector2(
									view.getInt16(offset + 4, true) / NETWORK_PRECISION,
									view.getInt16(offset + 6, true) / NETWORK_PRECISION
								)
							)
						)
					}
					return new S02SegmentUpdate(tab)
				case SPacketsType.S03:
					return new S03()
				case SPacketsType.S04:
					velo = new Vector2(view.getFloat64(1, true), view.getFloat64(9, true))
					factor = view.getFloat64(17, true)
					return new S04(new S03(), velo, factor)
				case SPacketsType.S05:
					pos = new Vector2(
						view.getInt16(1, true) / NETWORK_PRECISION,
						view.getInt16(3, true) / NETWORK_PRECISION
					)
					return new S05(new S03(), pos)
				case SPacketsType.S06:
					velo = new Vector2(
						view.getInt16(1, true) / NETWORK_PRECISION,
						view.getInt16(3, true) / NETWORK_PRECISION
					)
					factor = view.getInt16(5, true) / NETWORK_PRECISION
					pos = new Vector2(
						view.getInt16(7, true) / NETWORK_PRECISION,
						view.getInt16(9, true) / NETWORK_PRECISION
					)
					return new S06(pos, factor, velo)
				case SPacketsType.S07:
					const encoded = view.getUint16(1)
					const p1Score = (encoded >> 11) & 0x1f
					const p2Score = (encoded >> 6) & 0x1f
					const maxLives = (encoded >> 1) & 0x1f
					return new S07(p1Score, p2Score, maxLives)
				case SPacketsType.S08:
					return new S08(view.getUint8(1))
				case SPacketsType.S09:
					const nbsegDyn = view.getUint8(1)
					const tabDyn: Segment[] = []
					for (let i = 0; i < nbsegDyn; ++i) {
						const offset = 2 + i * 8
						tabDyn.push(
							new Segment(
								new Vector2(
									view.getInt16(offset, true) / NETWORK_PRECISION,
									view.getInt16(offset + 2, true) / NETWORK_PRECISION
								),
								new Vector2(
									view.getInt16(offset + 4, true) / NETWORK_PRECISION,
									view.getInt16(offset + 6, true) / NETWORK_PRECISION
								)
							)
						)
					}
					return new S09DynamicSegments(tabDyn)
				default:
					break
			}
		} catch (e) {
			console.log('ignored packet: ' + e)
		}
		return null
	}
}
