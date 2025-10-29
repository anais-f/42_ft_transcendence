import { Vector2 } from '../../../../math/Vector2.js'
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
})
