import { IC00PongBase } from './C00.js'
import { padDirection } from '../../../engine/PongPad.js'
import { CPacketsType } from '../packetTypes.js'

export class C01Move implements IC00PongBase {
	public constructor(
		public state: boolean,
		public dir: padDirection,
		public time = Date.now()
	) {}

	public getTime(): number {
		return this.time
	}

	/*
	 * timestamp start at 0
	 * type start at 8
	 * [{start/stop}{up/down}{}{}{}{}{}{}]
	 */
	public serialize(): ArrayBuffer {
		const buff = new ArrayBuffer(10) // 8 + 1 + 8 + 8
		const view = new DataView(buff)

		view.setFloat64(0, this.time, true) // timestamp [0 - 7]
		view.setUint8(8, CPacketsType.C01) // type [8]
		view.setUint8(
			9,
			0 |
				(this.state ? 0b10 : 0b00) |
				(this.dir === padDirection.UP ? 0b01 : 0b00)
		)

		return buff
	}
}
