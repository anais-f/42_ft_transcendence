import { S03BaseBall } from './S03.js'

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
})
