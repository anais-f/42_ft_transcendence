import { Vector2 } from '../../../math/Vector2'
import { C01Move } from './C01.js'
describe('c01', () => {
	test('serialize returns correct buffer', () => {
		const dir = new Vector2(7.54645, -0.5)
		const C01 = new C01Move(dir)
		const C01Ts = C01.getTime()
		const buff: ArrayBuffer = C01.serialize()
		const view = new DataView(buff)

		// Check timestamp (Float64 at 0)
		const ts = view.getFloat64(0, true)
		expect(typeof ts).toBe('number')
		expect(ts).toBeCloseTo(C01Ts)

		// Check type (Uint8 at 8)
		const type = view.getUint8(8)
		expect(type).toBe(0b11)

		// Check direction x (Float64 at 9)
		const x = view.getFloat64(9, true)
		expect(x).toBeCloseTo(dir.getX())

		// Check direction y (Float64 at 17)
		const y = view.getFloat64(17, true)
		expect(y).toBeCloseTo(dir.getY())
	})
})
