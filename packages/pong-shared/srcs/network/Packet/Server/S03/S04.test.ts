import { Vector2 } from '../../../../math/Vector2.js'
import { packetBuilder } from '../../packetBuilder.js'
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
	test('deserialize', () => {
		const buff = new ArrayBuffer(25)
		const view = new DataView(buff)

		const timestamp = 123456.789
		const type = 0b1101
		const v = new Vector2(324.32, -42)

		view.setFloat64(0, timestamp, true)
		view.setUint8(8, type)
		view.setFloat64(9, v.getX(), true)
		view.setFloat64(17, v.getY(), true)

		const p = packetBuilder.deserializeS(buff)
		expect(p).toBeInstanceOf(S04BallVeloChange)
		expect(p?.time).toBeCloseTo(timestamp)
		if (p instanceof S04BallVeloChange) {
			expect(p.getVelo().equals(v)).toBe(true)
		} else {
			throw new Error("Packet is not S04BallVeloChange")
		}
	})
})
