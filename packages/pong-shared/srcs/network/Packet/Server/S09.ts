import { Segment } from '../../../math/Segment.js'
import { SPacketsType } from '../packetTypes.js'
import { IS00PongBase } from './S00.js'

export class S09DynamicSegments implements IS00PongBase {
	constructor(public segs: Segment[]) {
		if (segs.length > 255) {
			throw new Error(`Too many segments max is 255`)
		}
	}

	/*
	 * trame
	 *
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
		const buff = new ArrayBuffer(2 + 32 * nbSegs)
		const view = new DataView(buff)
		const SEG_SIZE = 32
		const HEADER_SIZE = 2 // 1 + 1

		view.setUint8(0, SPacketsType.S09)
		view.setUint8(1, nbSegs)

		let offset = HEADER_SIZE
		for (const s of this.segs) {
			const segBuff = s.serialize()
			new Uint8Array(buff, offset, SEG_SIZE).set(new Uint8Array(segBuff))
			offset += SEG_SIZE
		}

		return buff
	}
}
