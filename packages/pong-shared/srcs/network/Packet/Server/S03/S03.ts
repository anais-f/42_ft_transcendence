import { SPacketsType } from '../../packetTypes.js'

export class AS03BaseBall {
	time: number

	constructor(time: number) {
		this.time = time
	}

	getTime(): number {
		return this.time
	}

	static createS03() {
		return new AS03BaseBall(Date.now())
	}

	protected fserialize(): ArrayBuffer {
		const buff = new ArrayBuffer(9)
		const view = new DataView(buff)

		view.setFloat64(0, this.time, true)
		view.setUint8(8, SPacketsType.S03)

		return buff
	}
}
