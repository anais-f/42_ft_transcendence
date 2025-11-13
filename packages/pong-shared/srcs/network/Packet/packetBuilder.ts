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
import { S0ASync } from './Server/S0A.js'
import { Segment } from '../../math/Segment.js'
import { PongObject } from '../../engine/objects/PongObject.js'
import { PongPad } from '../../engine/objects/PongPad.js'
import { PongBall } from '../../engine/objects/PongBall.js'
import { Circle } from '../../math/shapes/Circle.js'

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
				case SPacketsType.S0A: {
					const time = view.getFloat64(0, true)
					const nbseg = view.getUint8(9)
					let offset = 10

					const seg: Segment[] = []
					for (let i = 0; i < nbseg; ++i) {
						const x1 = view.getFloat64(offset, true)
						offset += 8
						const y1 = view.getFloat64(offset, true)
						offset += 8
						const x2 = view.getFloat64(offset, true)
						offset += 8
						const y2 = view.getFloat64(offset, true)
						offset += 8
						seg.push(new Segment(new Vector2(x1, y1), new Vector2(x2, y2)))
					}

					const padPlayer1 = view.getUint8(offset)
					offset += 1
					const padObj1 = PongObject.deserialize(buff.slice(offset))
					offset += padObj1.bufferSize

					const padPlayer2 = view.getUint8(offset)
					offset += 1
					const padObj2 = PongObject.deserialize(buff.slice(offset))
					offset += padObj2.bufferSize

					const pad1 = new PongPad(padPlayer1, padObj1)
					const pad2 = new PongPad(padPlayer2, padObj2)

					const ballObj = PongObject.deserialize(buff.slice(offset))
					offset += ballObj.bufferSize

					const vx = view.getFloat64(offset, true)
					offset += 8
					const vy = view.getFloat64(offset, true)
					offset += 8
					const ballVelo = new Vector2(vx, vy)

					const ball = new PongBall(
						(ballObj.getHitbox()[0] as Circle).getRad(),
						ballVelo
					)

					return new S0ASync(seg, [pad1, pad2], ball, time)
				}
				default:
					break
			}
		} catch (e) {
			console.log('ignored packet: ' + e)
		}
		return null
	}
}
