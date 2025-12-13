import { IC00PongBase } from './C00.js'
import { padDirection } from '../../../engine/PongPad.js'
import { CPacketsType } from '../packetTypes.js'

export class C01Move implements IC00PongBase {
	public constructor(
		public state: boolean,
		public dir: padDirection
	) {}

	/*
	 * type start at 0
	 * [{start/stop}{up/down}{}{}{}{}{}{}]
	 */
	public serialize(): ArrayBuffer {
		const buff = new ArrayBuffer(2) // 1 + 1
		const view = new DataView(buff)

		view.setUint8(0, CPacketsType.C01) // type [0]
		view.setUint8(
			1,
			0 |
				(this.state ? 0b10 : 0b00) |
				(this.dir === padDirection.UP ? 0b01 : 0b00)
		)

		return buff
	}
}
