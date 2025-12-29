import { Segment } from '../../../math/Segment.js'
import { NETWORK_PRECISION } from '../../../config.js'
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
	 * segs: [nbseg * 8]
	 * [ 8o
	 *		x1 2o (int16 * NETWORK_PRECISION)-\
	 *		y1 2o (int16 * NETWORK_PRECISION)_|_(v1)
	 *
	 *		x2 2o (int16 * NETWORK_PRECISION)-\
	 *		y2 2o (int16 * NETWORK_PRECISION)_|_(v2)
	 * ]
	 */
	serialize(): ArrayBuffer {
		const nbSegs = this.segs.length
		const SEG_SIZE = 8
		const HEADER_SIZE = 2
		const buff = new ArrayBuffer(HEADER_SIZE + SEG_SIZE * nbSegs)
		const view = new DataView(buff)

		view.setUint8(0, SPacketsType.S09)
		view.setUint8(1, nbSegs)

		let offset = HEADER_SIZE
		for (const s of this.segs) {
			view.setInt16(offset, Math.round(s.p1.x * NETWORK_PRECISION), true)
			view.setInt16(offset + 2, Math.round(s.p1.y * NETWORK_PRECISION), true)
			view.setInt16(offset + 4, Math.round(s.p2.x * NETWORK_PRECISION), true)
			view.setInt16(offset + 6, Math.round(s.p2.y * NETWORK_PRECISION), true)
			offset += SEG_SIZE
		}

		return buff
	}
}
