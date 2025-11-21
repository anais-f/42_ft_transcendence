import {
	C03BallBase as C03,
	C01Move as C01,
	C04BallVelo as C04,
	C05BallPos as C05
} from './Client/CPackets.js'

import {
	S01ServerTickConfirmation as S01,
	S03BaseBall as S03,
	S04BallVeloChange as S04,
	S05BallPos as S05
} from './Server/SPackets.js'

export enum CPacketsType {
	C00 = 0b00000001,
	C01 = 0b00000011,
	C03 = 0b00000101,
	C04 = 0b00001101,
	C05 = 0b00010101,
	C06 = 0b00011101
}

export enum SPacketsType {
	S00 = 0b00000001,
	S01 = 0b00000011,
	S03 = 0b00000101,
	S04 = 0b00001101,
	S05 = 0b00010101,
	S06 = 0b00011101,
	S0A = 0b00000111,
	S0B = 0b00001001
}
export class packetBuilder {
	private constructor() {}

	public static deserializeC(buff: ArrayBuffer): C01 | C03 | C04 | C05 | null {
		const view = new DataView(buff)

		try {
			const type = view.getUint8(8)

			switch (type) {
				case CPacketsType.C00:
					break
				case CPacketsType.C01:
					break
				case CPacketsType.C03:
					break
				case CPacketsType.C04:
					break
				case CPacketsType.C05:
					break
				case CPacketsType.C06:
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
				case SPacketsType.S0B:
					throw 'not implemented yet'
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
				case SPacketsType.S0A:
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
