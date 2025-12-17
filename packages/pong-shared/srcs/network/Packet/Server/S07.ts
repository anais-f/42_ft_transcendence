import { SPacketsType } from '../packetTypes.js'
import { IS00PongBase } from './S00.js'

export class S07Score implements IS00PongBase {
	public constructor(
		public p1Score: number = 0,
		public p2Score: number = 0
	) {}

	public serialize(): ArrayBuffer {
		const buff = new ArrayBuffer(3)
		const view = new DataView(buff)

		view.setUint8(0, SPacketsType.S07)
		view.setUint8(1, this.p1Score)
		view.setUint8(2, this.p2Score)

		return buff
	}
}
