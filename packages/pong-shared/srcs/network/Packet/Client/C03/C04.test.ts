import { Vector2 } from '../../../../math/Vector2.js'
import { C03BallBase } from './C03.js'
import { C04BallVelo } from './C04.js'

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
})
