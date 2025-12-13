import { SPacketsType } from '../packetTypes.js'
import { IS00PongBase } from './S00.js'

export class S07Score implements IS00PongBase {
	public constructor(
		public time: number = Date.now(),
		public p1Score: number = 0,
		public p2Score: number = 0
	) {}

	public getTime(): number {
		return this.time
	}

	public serialize(): ArrayBuffer {
		const buff = new ArrayBuffer(11)
		const view = new DataView(buff)

		view.setFloat64(0, this.time, true)
		view.setUint8(8, SPacketsType.S07)
		view.setUint8(9, this.p1Score)
		view.setUint8(10, this.p2Score)

		return buff
	}
}
