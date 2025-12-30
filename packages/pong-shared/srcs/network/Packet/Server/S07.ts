import { SPacketsType } from '../packetTypes.js'
import { IS00PongBase } from './S00.js'

export class S07Score implements IS00PongBase {
	public constructor(
		public p1Score: number = 0,
		public p2Score: number = 0,
		public maxLives: number = 0
	) {}

	private calculateParity(value: number): number {
		let count = 0
		for (let i = 0; i < 16; i++) {
			if ((value >> i) & 1) count++
		}
		return count % 2
	}

	public serialize(): ArrayBuffer {
		const buff = new ArrayBuffer(3)
		const view = new DataView(buff)

		const p1 = this.p1Score & 0x1f
		const p2 = this.p2Score & 0x1f
		const max = this.maxLives & 0x1f

		let encoded = (p1 << 11) | (p2 << 6) | (max << 1)
		const parity = this.calculateParity(encoded)
		encoded = encoded | parity

		view.setUint8(0, SPacketsType.S07)
		view.setUint16(1, encoded)

		return buff
	}
}
