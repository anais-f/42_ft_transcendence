import { packetBuilder } from '../packetBuilder.js'
import { SPacketsType } from '../packetTypes.js'
import { S07Score } from './S07.js'

describe('S07', () => {
	test('serialize returns correct buffer', () => {
		const p1Score = 3
		const p2Score = 5
		const S07 = new S07Score(p1Score, p2Score)
		const buff = S07.serialize()
		const view = new DataView(buff)

		expect(buff.byteLength).toBe(3)

		const type = view.getUint8(0)
		expect(type).toBe(SPacketsType.S07)

		expect(view.getUint8(1)).toBe(p1Score)
		expect(view.getUint8(2)).toBe(p2Score)
	})

	test('deserialize', () => {
		const buff = new ArrayBuffer(3)
		const view = new DataView(buff)

		const type = SPacketsType.S07
		const p1Score = 7
		const p2Score = 2

		view.setUint8(0, type)
		view.setUint8(1, p1Score)
		view.setUint8(2, p2Score)

		const p = packetBuilder.deserializeS(buff)
		expect(p).toBeInstanceOf(S07Score)
		expect((p as S07Score).p1Score).toBe(p1Score)
		expect((p as S07Score).p2Score).toBe(p2Score)
	})

	test('serialize + deserialize', () => {
		const p1Score = 10
		const p2Score = 8
		const S07 = new S07Score(p1Score, p2Score)
		const buff = S07.serialize()
		const SBack = packetBuilder.deserializeS(buff) as S07Score

		expect(SBack).toBeInstanceOf(S07Score)
		expect(SBack.p1Score).toBe(p1Score)
		expect(SBack.p2Score).toBe(p2Score)
	})
})
