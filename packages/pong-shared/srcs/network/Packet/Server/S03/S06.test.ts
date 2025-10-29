import { Vector2 } from '../../../../math/Vector2.js'
import { S06BallSync } from './S06.js'

describe('S06', () => {
	test('serialize returns correct buffer', () => {
		const pos = new Vector2(3242.23, -32)
		const velo = new Vector2(-3.23, -34.32)

		const S06 = new S06BallSync(pos, velo)
		const buff = S06.serialize()
		const view = new DataView(buff)

		const ts = view.getFloat64(0, true)
		expect(typeof ts).toBe('number')
		expect(ts).toBeCloseTo(S06.time)

		const type = view.getUint8(8)
		expect(type).toBe(0b11101)

		const vx = view.getFloat64(9, true)
		expect(vx).toBeCloseTo(velo.getX())

		const vy = view.getFloat64(17, true)
		expect(vy).toBeCloseTo(velo.getY())

		const px = view.getFloat64(25, true)
		expect(px).toBeCloseTo(pos.getX())

		const py = view.getFloat64(33, true)
		expect(py).toBeCloseTo(pos.getY())
	})
})
