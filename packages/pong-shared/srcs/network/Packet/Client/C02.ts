import { IC00PongBase } from './C00.js'
import { CPacketsType } from '../packetTypes.js'

export class C02RequestScore implements IC00PongBase {
	public constructor() {}

	public serialize(): ArrayBuffer {
		const buff = new ArrayBuffer(1)
		const view = new DataView(buff)

		view.setUint8(0, CPacketsType.C02)

		return buff
	}
}
