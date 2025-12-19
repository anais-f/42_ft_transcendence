import { packetBuilder } from '../packetBuilder.js'
import { SPacketsType } from '../packetTypes.js'
import { S07Score } from './S07.js'

describe('S07', () => {
	test('serialize returns correct buffer', () => {
		const p1Score = 3
		const p2Score = 5
		const maxLives = 10
		const S07 = new S07Score(p1Score, p2Score, maxLives)
		const buff = S07.serialize()
		const view = new DataView(buff)

		expect(buff.byteLength).toBe(3)

		const type = view.getUint8(0)
		expect(type).toBe(SPacketsType.S07)

		const encoded = view.getUint16(1)
		const decodedP1 = (encoded >> 11) & 0x1f
		const decodedP2 = (encoded >> 6) & 0x1f
		const decodedMax = (encoded >> 1) & 0x1f

		expect(decodedP1).toBe(p1Score)
		expect(decodedP2).toBe(p2Score)
		expect(decodedMax).toBe(maxLives)
	})

	test('deserialize', () => {
		const buff = new ArrayBuffer(3)
		const view = new DataView(buff)

		const type = SPacketsType.S07
		const p1Score = 7
		const p2Score = 2
		const maxLives = 15

		let encoded = (p1Score << 11) | (p2Score << 6) | (maxLives << 1)
		let count = 0
		for (let i = 0; i < 16; i++) {
			if ((encoded >> i) & 1) count++
		}
		encoded = encoded | (count % 2)

		view.setUint8(0, type)
		view.setUint16(1, encoded)

		const p = packetBuilder.deserializeS(buff) as S07Score
		expect(p).toBeInstanceOf(S07Score)
		expect(p.p1Score).toBe(p1Score)
		expect(p.p2Score).toBe(p2Score)
		expect(p.maxLives).toBe(maxLives)
	})

	test('serialize + deserialize', () => {
		const p1Score = 10
		const p2Score = 8
		const maxLives = 20
		const S07 = new S07Score(p1Score, p2Score, maxLives)
		const buff = S07.serialize()
		const SBack = packetBuilder.deserializeS(buff) as S07Score

		expect(SBack).toBeInstanceOf(S07Score)
		expect(SBack.p1Score).toBe(p1Score)
		expect(SBack.p2Score).toBe(p2Score)
		expect(SBack.maxLives).toBe(maxLives)
	})

	test('values clamped to 5 bits (max 31)', () => {
		const p1Score = 35 // Should be clamped to 31
		const p2Score = 40 // Should be clamped to 31
		const maxLives = 100 // Should be clamped to 31
		const S07 = new S07Score(p1Score, p2Score, maxLives)
		const buff = S07.serialize()
		const SBack = packetBuilder.deserializeS(buff) as S07Score

		expect(SBack).toBeInstanceOf(S07Score)
		expect(SBack.p1Score).toBe(3) // 35 & 0x1f = 3
		expect(SBack.p2Score).toBe(8) // 40 & 0x1f = 8
		expect(SBack.maxLives).toBe(4) // 100 & 0x1f = 4
	})

	test('max valid values', () => {
		const p1Score = 31
		const p2Score = 31
		const maxLives = 31
		const S07 = new S07Score(p1Score, p2Score, maxLives)
		const buff = S07.serialize()
		const SBack = packetBuilder.deserializeS(buff) as S07Score

		expect(SBack).toBeInstanceOf(S07Score)
		expect(SBack.p1Score).toBe(31)
		expect(SBack.p2Score).toBe(31)
		expect(SBack.maxLives).toBe(31)
	})
})
