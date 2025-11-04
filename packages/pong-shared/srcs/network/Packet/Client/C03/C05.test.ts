import { Vector2 } from '../../../../math/Vector2.js'
import { packetBuilder } from '../../packetBuilder.js'
import { C03BallBase } from './C03.js'
import { C05BallPos } from './C05.js'

describe('c05', () => {
	test('serialize returns correct buffer', () => {
		const pos = new Vector2(7.54645, -0.5)
		const C03 = C03BallBase.createC03()
		const C05 = new C05BallPos(C03, pos)
		const CTime = C05.getTime()
		const buff: ArrayBuffer = C05.serialize()
		const view = new DataView(buff)

		const ts = view.getFloat64(0, true)
		expect(typeof ts).toBe('number')
		expect(ts).toBeCloseTo(CTime)

		const type = view.getUint8(8)
		expect(type).toBe(0b10101)

		const x = view.getFloat64(9, true)
		expect(x).toBeCloseTo(pos.getX())

		const y = view.getFloat64(17, true)
		expect(y).toBeCloseTo(pos.getY())
	})

	test('deserialize', () => {
		const buff = new ArrayBuffer(25)
		const view = new DataView(buff)

		// Fill with example values
		const timestamp = 123456.789
		const type = 0b10101
		const x = 7.54645
		const y = -0.5

		// Write values to buffer
		view.setFloat64(0, timestamp, true) // timestamp at offset 0
		view.setUint8(8, type) // type at offset 8
		view.setFloat64(9, x, true) // x at offset 9
		view.setFloat64(17, y, true) // y at offset 17

		const p = packetBuilder.deserializeC(buff)

		expect(p).toBeInstanceOf(C05BallPos)
		expect(p?.time).toBeCloseTo(timestamp)
		expect(p).toBeInstanceOf(C05BallPos)
		if (p instanceof C05BallPos) {
			expect(p?.getPos()?.equals(new Vector2(x, y))).toBe(true)
		} else {
			throw new Error('Packet is not C05BallPos')
		}
	})
	test('serialize + deserialize', () => {
		const C03 = new C03BallBase(Date.now())
		const pos = new Vector2(342, -0.34)
		const C05 = new C05BallPos(C03, pos)
		const buff = C05.serialize()
		const CBack = packetBuilder.deserializeC(buff)

		expect(C03.getTime()).toEqual(CBack?.time)
		expect(C05.getTime()).toEqual(CBack?.time)
		if (CBack instanceof C05BallPos) {
			expect(C05.getPos()).toEqual(CBack.getPos())
		} else {
			throw new Error('Packet is not C05')
		}
	})
})
