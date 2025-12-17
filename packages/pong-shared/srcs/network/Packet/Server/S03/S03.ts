import { SPacketsType } from '../../packetTypes.js'

export class AS03BaseBall {
	static createS03() {
		return new AS03BaseBall()
	}

	protected fserialize(): ArrayBuffer {
		const buff = new ArrayBuffer(1)
		const view = new DataView(buff)

		view.setUint8(0, SPacketsType.S03)

		return buff
	}
}
