import { SPacketsType } from '../packetTypes.js'
import { IS00PongBase } from './S00.js'

export class S08Countdown implements IS00PongBase {
	public constructor(public seconds: number = 3) {}

	public serialize(): ArrayBuffer {
		const buff = new ArrayBuffer(2)
		const view = new DataView(buff)

		view.setUint8(0, SPacketsType.S08)
		view.setUint8(1, this.seconds)

		return buff
	}
}
