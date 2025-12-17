import { SPacketsType } from '../packetTypes.js'
import { IS00PongBase } from './S00.js'

export class S01ServerTickConfirmation implements IS00PongBase {
	public serialize(): ArrayBuffer {
		const buff = new ArrayBuffer(1)
		const view = new DataView(buff)

		view.setUint8(0, SPacketsType.S01)

		return buff
	}
}
