import { Vector2 } from '../../../../math/Vector2.js'
import { C03BallBase } from './C03.js'
import { C04BallVelo } from './C04.js'
import { packetBuilder } from '../../packetBuilder.js'

describe('c04', () => {
	test('serialize returns correct buffer', () => {
		const velo = new Vector2(7.54645, -0.5)
		const C03 = C03BallBase.createC03()
		const C04 = new C04BallVelo(C03, velo)
		const CTime = C04.getTime()
		const buff: ArrayBuffer = C04.serialize()
		const view = new DataView(buff)

		const ts = view.getFloat64(0, true)
		expect(typeof ts).toBe('number')
		expect(ts).toBeCloseTo(CTime)

		const type = view.getUint8(8)
		expect(type).toBe(0b1101)

		const x = view.getFloat64(9, true)
		expect(x).toBeCloseTo(velo.getX())

		const y = view.getFloat64(17, true)
		expect(y).toBeCloseTo(velo.getY())
	})

	test('deserialize', () => {
		const buff = new ArrayBuffer(25)
		const view = new DataView(buff)

		// Fill with example values
		const timestamp = 123456.789
		const type = 0b1101
		const vx = 7.54645
		const vy = -0.5

		// Write values to buffer
		view.setFloat64(0, timestamp, true) // timestamp at offset 0
		view.setUint8(8, type) // type at offset 8
		view.setFloat64(9, vx, true) // x at offset 9
		view.setFloat64(17, vy, true) // y at offset 17

		const p = packetBuilder.deserializeC(buff)
		expect(p).toBeInstanceOf(C04BallVelo)
		expect(p?.time).toBeCloseTo(timestamp)
		if (p instanceof C04BallVelo) {
			expect(p.getVelo().equals(new Vector2(vx, vy))).toBe(true)
		} else {
			throw new Error('Packet is not C05BallPos')
		}
	})
})
