import { packetBuilder } from '../packetBuilder.js'
import { SPacketsType } from '../packetTypes.js'
import { S08Countdown } from './S08.js'

describe('S08', () => {
	test('serialize returns correct buffer', () => {
		const seconds = 3
		const S08 = new S08Countdown(seconds)
		const buff = S08.serialize()
		const view = new DataView(buff)

		expect(buff.byteLength).toBe(2)

		const type = view.getUint8(0)
		expect(type).toBe(SPacketsType.S08)

		expect(view.getUint8(1)).toBe(seconds)
	})

	test('deserialize', () => {
		const buff = new ArrayBuffer(2)
		const view = new DataView(buff)

		const type = SPacketsType.S08
		const seconds = 2

		view.setUint8(0, type)
		view.setUint8(1, seconds)

		const p = packetBuilder.deserializeS(buff)
		expect(p).toBeInstanceOf(S08Countdown)
		expect((p as S08Countdown).seconds).toBe(seconds)
	})

	test('serialize + deserialize', () => {
		const seconds = 1
		const S08 = new S08Countdown(seconds)
		const buff = S08.serialize()
		const SBack = packetBuilder.deserializeS(buff) as S08Countdown

		expect(SBack).toBeInstanceOf(S08Countdown)
		expect(SBack.seconds).toBe(seconds)
	})

	test('countdown values 3, 2, 1, 0', () => {
		for (const seconds of [3, 2, 1, 0]) {
			const S08 = new S08Countdown(seconds)
			const buff = S08.serialize()
			const SBack = packetBuilder.deserializeS(buff) as S08Countdown

			expect(SBack.seconds).toBe(seconds)
		}
	})
})
