import { Segment } from '../../../math/Segment'
import { Vector2 } from '../../../math/Vector2'
import { packetBuilder } from '../packetBuilder.js'
import { SPacketsType } from '../packetTypes.js'
import { S02SegmentUpdate as S02, S02SegmentUpdate } from './S02.js'

describe('S02', () => {
	const p1 = new Vector2(-24.311, 4.23)
	const p2 = new Vector2(-24.324, 455554.7)
	const p3 = new Vector2(-24.393, 585954.2)
	const p4 = new Vector2(-24.234, -5854.2)
	const p5 = new Vector2(-24.029, 24.223)
	const p6 = new Vector2(324, 0)

	const S1 = new Segment(p1, p2)
	const S2 = new Segment(p2, p3)
	const S3 = new Segment(p3, p1)
	const S4 = new Segment(p4, p5)
	const S5 = new Segment(p5, p6)

	const tab = [S1, S2, S3, S4, S5]
	test('serialize returns correct buffer', () => {
		const buff = new S02(tab).serialize()
		const view = new DataView(buff)
		const HEADER_SIZE = 1 + 1
		const SEG_SIZE = 32

		expect(view.getUint8(0)).toBe(SPacketsType.S02)
		expect(view.getUint8(1)).toBe(tab.length)

		const pairs = [
			[p1, p2],
			[p2, p3],
			[p3, p1],
			[p4, p5],
			[p5, p6]
		]

		for (let i = 0; i < tab.length; i++) {
			const [pa, pb] = pairs[i]
			const offset = HEADER_SIZE + i * SEG_SIZE

			const x1 = view.getFloat64(offset + 0, true)
			const y1 = view.getFloat64(offset + 8, true)
			const x2 = view.getFloat64(offset + 16, true)
			const y2 = view.getFloat64(offset + 24, true)

			expect(x1).toBeCloseTo(pa.x, 6)
			expect(y1).toBeCloseTo(pa.y, 6)
			expect(x2).toBeCloseTo(pb.x, 6)
			expect(y2).toBeCloseTo(pb.y, 6)
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
})
