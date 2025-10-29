import { vi } from 'zod/locales'
import { Vector2 } from '../../math/Vector2.js'
import {
	C03BallBase as C03,
	C01Move as C01,
	C04BallVelo as C04,
	C05BallPos as C05,
	C06BallVeloPos as C06
} from './Client/CPackets.js'

import {
	S01ServerTickConfirmation as S01,
	S03BaseBall as S03,
	S04BallVeloChange as S04,
	S05BallPos as S05,
	S06BallSync as S06
} from './Server/SPackets.js'

export enum CPacketsType {
	C00 = 0b00000000,
	C01 = 0b00000001,
	C03 = 0b00000101,
	C04 = 0b00001101,
	C05 = 0b00010101,
	C06 = 0b00011101
}

export enum SPacketsType {
	S00 = 0b00000000,
	S01 = 0b00000001,
	S0A = 0b00000011,
	S03 = 0b00000101,
	S04 = 0b00001101,
	S05 = 0b00010101,
	S06 = 0b00011101,
	S0B = 0b00100011
}
export class packetBuilder {
	private constructor() {}

	public static deserializeC(buff: ArrayBuffer): C01 | C03 | null {
		const view = new DataView(buff)

		try {
			const type = view.getUint8(8)

			switch (type) {
				case CPacketsType.C00:
					break
				case CPacketsType.C01:
					return new C01(
						new Vector2(view.getFloat64(9, true), view.getFloat64(17, true)),
						view.getFloat64(0, true)
					)
				case CPacketsType.C03:
					return new C03(view.getFloat64(0, true))
				case CPacketsType.C04:
					return new C04(
						new C03(view.getFloat64(0, true)),
						new Vector2(view.getFloat64(9, true), view.getFloat64(17, true))
					)
				case CPacketsType.C05:
					return new C05(
						new C03(view.getFloat64(0, true)),
						new Vector2(view.getFloat64(9, true), view.getFloat64(17, true))
					)
				case CPacketsType.C06:
					return new C06(
						new Vector2(view.getFloat64(25, true), view.getFloat64(33, true)),
						new Vector2(view.getFloat64(9, true), view.getFloat64(17, true)),
						view.getFloat64(0, true)
					)
				default:
					break
			}
			throw 'unknow type'
		} catch (e) {
			console.log('ignored packet')
		}
		return null
	}
	
	public static deserializeS(buff: ArrayBuffer): S01 | S03 | null {
		const view = new DataView(buff)

		try {
			const type = view.getUint8(8)

			switch (type) {
				case SPacketsType.S00:
					break
				case SPacketsType.S0A:
					throw 'not implemented yet'
				case SPacketsType.S0B:
					throw 'not implemented yet'
				case SPacketsType.S01:
					return new S01(view.getFloat64(0, true))
				case SPacketsType.S03:
					return new S03(view.getFloat64(0, true))
				case SPacketsType.S04:
					return new S04(
						new S03(view.getFloat64(0, true)),
						new Vector2(view.getFloat64(9, true), view.getFloat64(17, true))
					)
				case SPacketsType.S05:
					return new S05(
						new S03(view.getFloat64(0, true)),
						new Vector2(view.getFloat64(9, true), view.getFloat64(17, true))
					)
				case SPacketsType.S06:
					return new S06(
						new Vector2(view.getFloat64(25, true), view.getFloat64(33, true)),
						new Vector2(view.getFloat64(9, true), view.getFloat64(17, true)),
						view.getFloat64(0, true)
					)
				default:
					break
			}
		} catch (e) {
			console.log('ignored packet')
		}
		return null
	}
}
