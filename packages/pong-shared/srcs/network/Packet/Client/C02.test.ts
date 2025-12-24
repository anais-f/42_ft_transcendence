import { C02RequestScore } from './C02.js'
import { CPacketsType } from '../packetTypes.js'
import { packetBuilder } from '../packetBuilder.js'

describe('C02', () => {
	test('serialize returns correct buffer', () => {
		const C02 = new C02RequestScore()
		const buff = C02.serialize()
		const view = new DataView(buff)

		expect(buff.byteLength).toBe(1)

		const type = view.getUint8(0)
		expect(type).toBe(CPacketsType.C02)
	})

	test('deserialize', () => {
		const buff = new ArrayBuffer(1)
		const view = new DataView(buff)

		view.setUint8(0, CPacketsType.C02)

		const p = packetBuilder.deserializeC(buff)
		expect(p).toBeInstanceOf(C02RequestScore)
	})

	test('serialize + deserialize', () => {
		const original = new C02RequestScore()
		const buff = original.serialize()

		const reconstructed = packetBuilder.deserializeC(buff)
		expect(reconstructed).toBeInstanceOf(C02RequestScore)
	})
})
