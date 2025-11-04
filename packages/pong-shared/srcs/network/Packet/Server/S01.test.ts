import { packetBuilder } from '../packetBuilder.js'
import { S01ServerTickConfirmation as S01TC } from './S01.js'

describe('S01', () => {
	test('serialize returns correct buffer', () => {
		const S01 = new S01TC()
		const buff = S01.serialize()
		const view = new DataView(buff)

		const ts = view.getFloat64(0, true)
		expect(typeof ts).toBe('number')
		expect(ts).toBeCloseTo(S01.time)

		const type = view.getUint8(8)
		expect(type).toBe(0b11)
	})
	test('deserialize', () => {
		const buff = new ArrayBuffer(9)
		const view = new DataView(buff)

		const timestamp = 123456.789
		const type = 0b11

		view.setFloat64(0, timestamp, true)
		view.setUint8(8, type)

		const p = packetBuilder.deserializeS(buff)
		expect(p).toBeInstanceOf(S01TC)
		expect(p?.time).toBeCloseTo(timestamp)
	})

	test('serialize + deserialize', () => {
		const S01 = new S01TC()
		const buff = S01.serialize()
		const SBack = packetBuilder.deserializeS(buff)

		expect(SBack?.getTime()).toBe(S01.time)
	})
})
