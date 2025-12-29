import { Segment } from '../../../math/Segment'
import { Vector2 } from '../../../math/Vector2'
import { NETWORK_PRECISION } from '../../../config.js'
import { packetBuilder } from '../packetBuilder.js'
import { SPacketsType } from '../packetTypes.js'
import { S02SegmentUpdate as S02, S02SegmentUpdate } from './S02.js'

describe('S02', () => {
	// Use realistic game values (arena is -20 to 20)
	const p1 = new Vector2(-20, -10)
	const p2 = new Vector2(20, -10)
	const p3 = new Vector2(20, 10)
	const p4 = new Vector2(-20, 10)
	const p5 = new Vector2(-16, 2)
	const p6 = new Vector2(-16, -2)

	const S1 = new Segment(p1, p2)
	const S2 = new Segment(p2, p3)
	const S3 = new Segment(p3, p4)
	const S4 = new Segment(p4, p1)
	const S5 = new Segment(p5, p6)

	const tab = [S1, S2, S3, S4, S5]

	// Int16 format: 8 bytes per segment
	const SEG_SIZE = 8
	const HEADER_SIZE = 2

	test('serialize returns correct buffer', () => {
		const buff = new S02(tab).serialize()
		const view = new DataView(buff)

		expect(view.getUint8(0)).toBe(SPacketsType.S02)
		expect(view.getUint8(1)).toBe(tab.length)
		expect(buff.byteLength).toBe(HEADER_SIZE + SEG_SIZE * tab.length)

		const pairs = [
			[p1, p2],
			[p2, p3],
			[p3, p4],
			[p4, p1],
			[p5, p6]
		]

		for (let i = 0; i < tab.length; i++) {
			const [pa, pb] = pairs[i]
			const offset = HEADER_SIZE + i * SEG_SIZE

			const x1 = view.getInt16(offset + 0, true) / NETWORK_PRECISION
			const y1 = view.getInt16(offset + 2, true) / NETWORK_PRECISION
			const x2 = view.getInt16(offset + 4, true) / NETWORK_PRECISION
			const y2 = view.getInt16(offset + 6, true) / NETWORK_PRECISION

			expect(x1).toBeCloseTo(pa.x, 2)
			expect(y1).toBeCloseTo(pa.y, 2)
			expect(x2).toBeCloseTo(pb.x, 2)
			expect(y2).toBeCloseTo(pb.y, 2)
		}
	})

	test('deserialize + serialize', () => {
		const O2 = new S02(tab)
		const buff = O2.serialize()

		const NO2 = packetBuilder.deserializeS(buff)

		expect(NO2).toBeInstanceOf(S02SegmentUpdate)
		if (!(NO2 instanceof S02SegmentUpdate)) {
			throw '...'
		}
		tab.forEach((seg) =>
			expect(
				NO2.segs.some((e) => e.p1.equals(seg.p1) && e.p2.equals(seg.p2))
			).toBe(true)
		)
	})

	test('precision is maintained within NETWORK_PRECISION bounds', () => {
		const precisionSegs = [
			new Segment(new Vector2(1.23, -4.56), new Vector2(7.89, -0.12))
		]
		const S02Precision = new S02(precisionSegs)
		const buff = S02Precision.serialize()

		const NO2 = packetBuilder.deserializeS(buff) as S02SegmentUpdate
		expect(NO2.segs[0].p1.x).toBeCloseTo(1.23, 2)
		expect(NO2.segs[0].p1.y).toBeCloseTo(-4.56, 2)
		expect(NO2.segs[0].p2.x).toBeCloseTo(7.89, 2)
		expect(NO2.segs[0].p2.y).toBeCloseTo(-0.12, 2)
	})
})
