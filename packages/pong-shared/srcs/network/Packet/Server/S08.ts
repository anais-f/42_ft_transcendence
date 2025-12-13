import { SPacketsType } from '../packetTypes.js'
import { IS00PongBase } from './S00.js'

export class S08Countdown implements IS00PongBase {
	public constructor(
		public time: number = Date.now(),
		public seconds: number = 3
	) {}

	public getTime(): number {
		return this.time
	}

	public serialize(): ArrayBuffer {
		const buff = new ArrayBuffer(10)
		const view = new DataView(buff)

		view.setFloat64(0, this.time, true)
		view.setUint8(8, SPacketsType.S08)
		view.setUint8(9, this.seconds)

		return buff
	}
}
