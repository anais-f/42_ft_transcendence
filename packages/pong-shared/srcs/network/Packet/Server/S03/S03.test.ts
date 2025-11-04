import { S03BaseBall } from './S03.js'
import { packetBuilder } from '../../packetBuilder.js'

describe('S03', () => {
	test('serialize returns correct buffer', () => {
		const S03 = S03BaseBall.createS03()
		// @ts-ignore (jest can do it)
		const buff = S03.fserialize()
		const view = new DataView(buff)

		const ts = view.getFloat64(0, true)
		expect(typeof ts).toBe('number')
		expect(ts).toBeCloseTo(S03.time)

		const type = view.getUint8(8)
		expect(type).toBe(0b101)
	})

	test('deserialize', () => {
		const buff = new ArrayBuffer(9)
		const view = new DataView(buff)

		const timestamp = 123456.789
		const type = 0b101

		view.setFloat64(0, timestamp, true)
		view.setUint8(8, type)

		const p = packetBuilder.deserializeS(buff)
		expect(p).toBeInstanceOf(S03BaseBall)
		expect(p?.time).toBeCloseTo(timestamp)
	})

	test('serialize + deserialize', () => {
		const S03 = S03BaseBall.createS03()
		// @ts-ignore
		const buff = S03.fserialize()
		const SBack = packetBuilder.deserializeS(buff)

		expect(SBack?.getTime()).toBe(S03.time)
	})
})
