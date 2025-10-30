import { Vector2 } from '../../../math/Vector2'
import { C01Move } from './C01.js'
import { packetBuilder } from '../packetBuilder.js'

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

	test('deserialize', () => {
		const buff = new ArrayBuffer(25)
		const view = new DataView(buff)

		// Fill with example values
		const timestamp = 123456.789
		const type = 0b11
		const x = 7.54645
		const y = -0.5

		// Write values to buffer
		view.setFloat64(0, timestamp, true) // timestamp at offset 0
		view.setUint8(8, type) // type at offset 8
		view.setFloat64(9, x, true) // x at offset 9
		view.setFloat64(17, y, true) // y at offset 17

		const p = packetBuilder.deserializeC(buff)
		expect(p).toBeInstanceOf(C01Move)
		expect(p?.time).toBeCloseTo(timestamp)
		if (p instanceof C01Move) {
			expect(p?.getDirection()?.equals(new Vector2(x, y))).toBe(true)
		} else {
			throw new Error('Packet is not C05BallPos')
		}
	})
})
