import { Segment } from '../../../math/Segment'
import { Vector2 } from '../../../math/Vector2'
import { packetBuilder } from '../packetBuilder.js'
import { SPacketsType } from '../packetTypes.js'
import { S09DynamicSegments as S09, S09DynamicSegments } from './S09.js'

describe('S09', () => {
	const p1 = new Vector2(-16, 2)
	const p2 = new Vector2(-15, 0)
	const p3 = new Vector2(-16, -2)
	const p4 = new Vector2(16, 2)
	const p5 = new Vector2(15, 0)
	const p6 = new Vector2(16, -2)

	const padSegL1 = new Segment(p1, p2)
	const padSegL2 = new Segment(p2, p3)
	const padSegR1 = new Segment(p4, p5)
	const padSegR2 = new Segment(p5, p6)

	const tab = [padSegL1, padSegL2, padSegR1, padSegR2]

	test('serialize returns correct buffer', () => {
		const buff = new S09(tab).serialize()
		const view = new DataView(buff)
		const HEADER_SIZE = 1 + 1
		const SEG_SIZE = 32

		expect(view.getUint8(0)).toBe(SPacketsType.S09)
		expect(view.getUint8(1)).toBe(tab.length)

		const pairs = [
			[p1, p2],
			[p2, p3],
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
		const O9 = new S09(tab)
		const buff = O9.serialize()

		const NO9 = packetBuilder.deserializeS(buff)

		expect(NO9).toBeInstanceOf(S09DynamicSegments)
		if (!(NO9 instanceof S09DynamicSegments)) {
			throw '...'
		}
		tab.forEach((seg) =>
			expect(
				NO9.segs.some((e) => e.p1.equals(seg.p1) && e.p2.equals(seg.p2))
			).toBe(true)
		)
	})

	test('empty segments array', () => {
		const S09Empty = new S09([])
		const buff = S09Empty.serialize()
		const view = new DataView(buff)

		expect(buff.byteLength).toBe(2)
		expect(view.getUint8(0)).toBe(SPacketsType.S09)
		expect(view.getUint8(1)).toBe(0)
	})

	test('single segment', () => {
		const singleSeg = [new Segment(new Vector2(1, 2), new Vector2(3, 4))]
		const S09Single = new S09(singleSeg)
		const buff = S09Single.serialize()

		expect(buff.byteLength).toBe(2 + 32)

		const NO9 = packetBuilder.deserializeS(buff) as S09DynamicSegments
		expect(NO9.segs.length).toBe(1)
		expect(NO9.segs[0].p1.x).toBeCloseTo(1, 6)
		expect(NO9.segs[0].p1.y).toBeCloseTo(2, 6)
		expect(NO9.segs[0].p2.x).toBeCloseTo(3, 6)
		expect(NO9.segs[0].p2.y).toBeCloseTo(4, 6)
	})
})
