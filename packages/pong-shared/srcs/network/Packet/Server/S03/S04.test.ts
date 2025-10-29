import { Vector2 } from '../../../../math/Vector2.js'
import { S03BaseBall } from './S03.js'
import { S04BallVeloChange } from './S04.js'

describe('S04', () => {
	test('serialize returns correct buffer', () => {
		const velo = new Vector2(497.34, -232)
		const S03 = S03BaseBall.createS03()
		const S04 = new S04BallVeloChange(S03, velo)
		const buff = S04.serialize()
		const view = new DataView(buff)

		const ts = view.getFloat64(0, true)
		expect(typeof ts).toBe('number')
		expect(ts).toBeCloseTo(S03.time)
		expect(ts).toBeCloseTo(S04.time)

		const type = view.getUint8(8)
		expect(type).toBe(0b1101)

		const x = view.getFloat64(9, true)
		const y = view.getFloat64(17, true)
		expect(x).toBeCloseTo(velo.getX())
		expect(y).toBeCloseTo(velo.getY())
	})
})
