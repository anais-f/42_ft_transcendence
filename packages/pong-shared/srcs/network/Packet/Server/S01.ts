import { SPacketsType } from '../packetTypes.js'
import { IS00PongBase } from './S00.js'

export class S01ServerTickConfirmation implements IS00PongBase {
	public constructor(public time: number = Date.now()) {}

	public getTime(): number {
		return this.time
	}

	public serialize(): ArrayBuffer {
		const buff = new ArrayBuffer(9)
		const view = new DataView(buff)

		view.setFloat64(0, this.time, true)
		view.setUint8(8, SPacketsType.S01)

		return buff
	}
}
