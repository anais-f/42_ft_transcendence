import { Segment } from '../../../math/Segment.js'
import { IS00PongBase } from './S00.js'

export class S02SegmentUpdate implements IS00PongBase {
	constructor(
		public time: number = Date.now(),
		private segs: Segment[]
	) {
		if (segs.length > 255) {
			throw new Error(`Too many segments max is 255`)
		}
	}

	getTime(): number {
		return this.time
	}

	/*
	 * trame
	 *
	 * time 8o (float64)
	 * type 1o (uint8)
	 * nb seg 1o [max 255]
	 * segs: [nbseg * 32 (32-8160)]
	 * [ 32o
	 *		x1 8o (float64)-\
	 *		y1 8o (float64)_|_(v1)
	 *
	 *		x2 8o (float64)-\
	 *		y2 8o (float64)_|_(v2)
	 * ]
	 */
	serialize(): ArrayBuffer {
		const nbSegs = this.segs.length
		const buff = new ArrayBuffer(10 + 32 * nbSegs)
		const view = new DataView(buff)
		const SEG_SIZE = 32
		const HEADER_SIZE = 10 // 8 + 1 + 1

		view.setFloat64(0, this.time, true)
		view.setUint8(8, 0b11)

		view.setUint8(9, nbSegs)

		let offset = HEADER_SIZE
		for (const s of this.segs) {
			const segBuff = s.serialize()
			new Uint8Array(buff, offset, SEG_SIZE).set(new Uint8Array(segBuff))
			offset += SEG_SIZE
		}

		return buff
	}
}
