import { C01Move as C01 } from './Client/CPackets.js'

import {
	S01ServerTickConfirmation as S01,
	S03BaseBall as S03,
	S04BallVeloChange as S04,
	S05BallPos as S05
} from './Server/SPackets.js'

export enum CPacketsType {
	C00 = 0b00000001,
	C01 = 0b00000011
}

export enum SPacketsType {
	S00 = 0b00000001,
	S01 = 0b00000011,
	S03 = 0b00000101,
	S04 = 0b00001101,
	S05 = 0b00010101,
	S06 = 0b00011101
}
export class packetBuilder {
	private constructor() {}

	public static deserializeC(buff: ArrayBuffer): C01 | null {
		const view = new DataView(buff)

		try {
			const type = view.getUint8(8)

			switch (type) {
				case CPacketsType.C00:
					break
				case CPacketsType.C01:
					break
				default:
					break
			}
			throw 'unknow type'
		} catch (e) {
			console.log('ignored packet: ' + e)
		}
		return null
	}

	public static deserializeS(buff: ArrayBuffer): S01 | S03 | S04 | S05 | null {
		const view = new DataView(buff)

		try {
			const type = view.getUint8(8)

			switch (type) {
				case SPacketsType.S00:
					break
				case SPacketsType.S01:
					break
				case SPacketsType.S03:
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
