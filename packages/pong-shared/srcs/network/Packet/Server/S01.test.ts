import { packetBuilder } from '../packetBuilder.js'
import { SPacketsType } from '../packetTypes.js'
import { S01ServerTickConfirmation as S01TC } from './S01.js'

describe('S01', () => {
	test('serialize returns correct buffer', () => {
		const S01 = new S01TC()
		const buff = S01.serialize()
		const view = new DataView(buff)

		const type = view.getUint8(0)
		expect(type).toBe(0b11)
	})
	test('deserialize', () => {
		const buff = new ArrayBuffer(1)
		const view = new DataView(buff)

		const type = SPacketsType.S01

		view.setUint8(0, type)

		const p = packetBuilder.deserializeS(buff)
		expect(p).toBeInstanceOf(S01TC)
	})

	test('serialize + deserialize', () => {
		const S01 = new S01TC()
		const buff = S01.serialize()
		const SBack = packetBuilder.deserializeS(buff)

		expect(SBack).toBeInstanceOf(S01TC)
	})
})
