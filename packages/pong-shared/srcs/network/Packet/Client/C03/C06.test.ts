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
})
