import { C03BallBase } from './C03'

describe('C03', () => {
	test('serialize returns correct buffer', () => {
		const C03 = C03BallBase.createC03()
		// @ts-ignore (jest can call private methode)
		const buff = C03.fserialize()
		const view = new DataView(buff)

		const ts = view.getFloat64(0, true)
		expect(typeof ts).toBe('number')
		expect(ts).toBeCloseTo(C03.time)

		expect(view.getUint8(8)).toBe(0b101)
	})
})
