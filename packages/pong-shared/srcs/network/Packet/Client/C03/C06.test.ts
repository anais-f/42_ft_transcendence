import { Vector2 } from '../../../../math/Vector2.js'
import { C06BallVeloPos } from './C06.js'

describe('c06', () => {
	test('serialize returns correct buffer', () => {
		const pos = new Vector2(-42.42, 13.37)
		const velo = new Vector2(7.54645, -0.5)
		const C06 = new C06BallVeloPos(pos, velo)
		const CTime = C06.getTime()
		const buff: ArrayBuffer = C06.serialize()
		const view = new DataView(buff)

		// time
		const ts = view.getFloat64(0, true)
		expect(typeof ts).toBe('number')
		expect(ts).toBeCloseTo(CTime)

		// type
		const type = view.getUint8(8)
		expect(type).toBe(0b11101)

		// velocity
		const vx = view.getFloat64(9, true)
		expect(vx).toBeCloseTo(velo.getX())

		const vy = view.getFloat64(17, true)
		expect(vy).toBeCloseTo(velo.getY())

		// position
		const px = view.getFloat64(25, true)
		expect(px).toBeCloseTo(pos.getX())

		const py = view.getFloat64(33, true)
		expect(py).toBeCloseTo(pos.getY())
	})
	/*
	test('deserialize', () => {
		const buff = new ArrayBuffer(41)
		const view = new DataView(buff)

		// Fill with example values
		const timestamp = 123456.789
		const type = 0b11101
		const vx = 7.54645
		const vy = -0.5
		const velo = new Vector2(vx, vy)
		const x = 2342
		const y = -34.6
		const pos = new Vector2(x, y)

		// Write values to buffer
		view.setFloat64(0, timestamp, true) // timestamp at offset 0
		view.setUint8(8, type) // type at offset 8
		view.setFloat64(9, vx, true) // vx at offset 9
		view.setFloat64(17, vy, true) // vy at offset 17
		view.setFloat64(25, x, true)
		view.setFloat64(33, y, true)

		const p = packetBuilder.deserializeC(buff)

		expect(p).toBeInstanceOf(C06BallVeloPos)
		expect(p?.time).toBeCloseTo(timestamp)
		expect(p).toBeInstanceOf(C06BallVeloPos)
		if (p instanceof C06BallVeloPos) {
			expect(p.getVelo().equals(velo)).toBe(true)
			expect(p.getPos().equals(pos)).toBe(true)
		} else {
			throw new Error('Packet is not C06')
		}
	})
	test('serialize + deserialize', () => {
		const V = new Vector2(342, -0.34)
		const pos = new Vector2(-3.42, -0.34)
		const C06 = new C06BallVeloPos(pos, V)
		const buff = C06.serialize()
		const CBack = packetBuilder.deserializeC(buff)

		expect(C06.getTime()).toEqual(CBack?.time)
		if (CBack instanceof C06BallVeloPos) {
			expect(C06.getVelo().equals(CBack.getVelo())).toBe(true)
			expect(C06.getPos().equals(CBack.getPos())).toBe(true)
		} else {
			throw new Error('Packet is not C06')
		}
	})
   */
})
