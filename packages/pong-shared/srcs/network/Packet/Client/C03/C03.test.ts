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
	/*
	test('deserialize', () => {
		const buff = new ArrayBuffer(9)
		const view = new DataView(buff)

		// Fill with example values
		const timestamp = 123456.789
		const type = 0b101

		// Write values to buffer
		view.setFloat64(0, timestamp, true) // timestamp at offset 0
		view.setUint8(8, type) // type at offset 8

		const p = packetBuilder.deserializeC(buff)
		expect(p).toBeInstanceOf(C03BallBase)
	})
	test('serialize + deserialize', () => {
		const C = new C03BallBase(Date.now())
		// @ts-ignore (jest can call private methode)
		const buff = C.fserialize()
		const CBack = packetBuilder.deserializeC(buff)
		expect(C.getTime()).toEqual(CBack?.time)
	})
   */
})
