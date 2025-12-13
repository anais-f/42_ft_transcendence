import { packetBuilder } from '../packetBuilder.js'
import { SPacketsType } from '../packetTypes.js'
import { S08Countdown } from './S08.js'

describe('S08', () => {
	test('serialize returns correct buffer', () => {
		const seconds = 3
		const S08 = new S08Countdown(Date.now(), seconds)
		const buff = S08.serialize()
		const view = new DataView(buff)

		expect(buff.byteLength).toBe(10)

		const ts = view.getFloat64(0, true)
		expect(typeof ts).toBe('number')
		expect(ts).toBeCloseTo(S08.time)

		const type = view.getUint8(8)
		expect(type).toBe(SPacketsType.S08)

		expect(view.getUint8(9)).toBe(seconds)
	})

	test('deserialize', () => {
		const buff = new ArrayBuffer(10)
		const view = new DataView(buff)

		const timestamp = 123456.789
		const type = SPacketsType.S08
		const seconds = 2

		view.setFloat64(0, timestamp, true)
		view.setUint8(8, type)
		view.setUint8(9, seconds)

		const p = packetBuilder.deserializeS(buff)
		expect(p).toBeInstanceOf(S08Countdown)
		expect(p?.time).toBeCloseTo(timestamp)
		expect((p as S08Countdown).seconds).toBe(seconds)
	})

	test('serialize + deserialize', () => {
		const seconds = 1
		const S08 = new S08Countdown(Date.now(), seconds)
		const buff = S08.serialize()
		const SBack = packetBuilder.deserializeS(buff) as S08Countdown

		expect(SBack).toBeInstanceOf(S08Countdown)
		expect(SBack.getTime()).toBe(S08.time)
		expect(SBack.seconds).toBe(seconds)
	})

	test('countdown values 3, 2, 1, 0', () => {
		for (const seconds of [3, 2, 1, 0]) {
			const S08 = new S08Countdown(Date.now(), seconds)
			const buff = S08.serialize()
			const SBack = packetBuilder.deserializeS(buff) as S08Countdown

			expect(SBack.seconds).toBe(seconds)
		}
	})
})
