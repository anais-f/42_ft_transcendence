import { packetBuilder } from '../../packetBuilder.js'
import { AS03BaseBall } from './S03.js'

describe('S03', () => {
	test('serialize returns correct buffer', () => {
		const S03 = AS03BaseBall.createS03()
		// @ts-ignore (jest can do it)
		const buff = S03.fserialize()
		const view = new DataView(buff)

		const type = view.getUint8(0)
		expect(type).toBe(0b101)
	})

	test('deserialize', () => {
		const buff = new ArrayBuffer(1)
		const view = new DataView(buff)

		const type = 0b101

		view.setUint8(0, type)

		const p = packetBuilder.deserializeS(buff)
		expect(p).toBeInstanceOf(AS03BaseBall)
	})

	test('serialize + deserialize', () => {
		const S03 = AS03BaseBall.createS03()
		// @ts-ignore
		const buff = S03.fserialize()
		const SBack = packetBuilder.deserializeS(buff)

		expect(SBack).toBeInstanceOf(AS03BaseBall)
	})
})
