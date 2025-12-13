import { packetBuilder } from '../packetBuilder.js'
import { SPacketsType } from '../packetTypes.js'
import { S07Score } from './S07.js'

describe('S07', () => {
	test('serialize returns correct buffer', () => {
		const p1Score = 3
		const p2Score = 5
		const S07 = new S07Score(Date.now(), p1Score, p2Score)
		const buff = S07.serialize()
		const view = new DataView(buff)

		expect(buff.byteLength).toBe(11)

		const ts = view.getFloat64(0, true)
		expect(typeof ts).toBe('number')
		expect(ts).toBeCloseTo(S07.time)

		const type = view.getUint8(8)
		expect(type).toBe(SPacketsType.S07)

		expect(view.getUint8(9)).toBe(p1Score)
		expect(view.getUint8(10)).toBe(p2Score)
	})

	test('deserialize', () => {
		const buff = new ArrayBuffer(11)
		const view = new DataView(buff)

		const timestamp = 123456.789
		const type = SPacketsType.S07
		const p1Score = 7
		const p2Score = 2

		view.setFloat64(0, timestamp, true)
		view.setUint8(8, type)
		view.setUint8(9, p1Score)
		view.setUint8(10, p2Score)

		const p = packetBuilder.deserializeS(buff)
		expect(p).toBeInstanceOf(S07Score)
		expect(p?.time).toBeCloseTo(timestamp)
		expect((p as S07Score).p1Score).toBe(p1Score)
		expect((p as S07Score).p2Score).toBe(p2Score)
	})

	test('serialize + deserialize', () => {
		const p1Score = 10
		const p2Score = 8
		const S07 = new S07Score(Date.now(), p1Score, p2Score)
		const buff = S07.serialize()
		const SBack = packetBuilder.deserializeS(buff) as S07Score

		expect(SBack).toBeInstanceOf(S07Score)
		expect(SBack.getTime()).toBe(S07.time)
		expect(SBack.p1Score).toBe(p1Score)
		expect(SBack.p2Score).toBe(p2Score)
	})
})
