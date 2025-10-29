import { IS00PongBase } from './S00.js'

export class S01ServerTickConfirmation implements IS00PongBase {
	time: number

	constructor() {
		this.time = Date.now()
	}

	getTime(): number {
		return this.time
	}

	serialize(): ArrayBuffer {
		const buff = new ArrayBuffer(9)
		const view = new DataView(buff)

		view.setFloat64(0, this.time, true)
		view.setUint8(8, 0b11)

		return buff
	}
}
