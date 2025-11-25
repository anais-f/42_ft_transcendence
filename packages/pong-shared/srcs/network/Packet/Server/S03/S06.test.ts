import { Vector2 } from '../../../../math/Vector2.js'
import { packetBuilder } from '../../packetBuilder.js'
import { S06BallSync } from './S06.js'

describe('S06', () => {
	test('serialize returns correct buffer', () => {
		const pos = new Vector2(3242.23, -32)
		const velo = new Vector2(-3.23, -34.32)
		const factor = 1
		const S06 = new S06BallSync(pos, factor, velo)
		const buff = S06.serialize()

		const view = new DataView(buff)

		const ts = view.getFloat64(0, true)
		const type = view.getUint8(8)
		const vx = view.getFloat64(9, true)
		const vy = view.getFloat64(17, true)
		const f = view.getFloat64(25, true)
		const px = view.getFloat64(33, true)
		const py = view.getFloat64(41, true)

		expect(typeof ts).toBe('number')
		expect(ts).toBeCloseTo(S06.time)
		expect(type).toBe(0b11101)
		expect(vx).toBeCloseTo(velo.getX())
		expect(vy).toBeCloseTo(velo.getY())
		expect(px).toBeCloseTo(pos.getX())
		expect(py).toBeCloseTo(pos.getY())
		expect(f).toBeCloseTo(factor)
	})

	test('deserialize', () => {
		const buff = new ArrayBuffer(49)
		const view = new DataView(buff)
		const timestamp = 123456.789
		const type = 0b11101
		const v = new Vector2(324.32, -42)
		const pos = new Vector2(32.3, 3)
		const factor = .8

		view.setFloat64(0, timestamp, true)
		view.setUint8(8, type)
		view.setFloat64(9, v.getX(), true)
		view.setFloat64(17, v.getY(), true)
		view.setFloat64(25, factor, true)

		view.setFloat64(33, pos.getX(), true)
		view.setFloat64(41, pos.getY(), true)

		const p = packetBuilder.deserializeS(buff)
		expect(p).toBeInstanceOf(S06BallSync)
		expect(p?.time).toBeCloseTo(timestamp)
		if (p instanceof S06BallSync) {
			expect(p.getVelo().equals(v)).toBe(true)
			expect(p.getPos().equals(pos)).toBe(true)
		} else {
			throw new Error('Packet is not S06BallSync')
		}
	})

	test('serialize + deserialize', () => {
		const pos = new Vector2(-23.322, -34)
		const velo = new Vector2(23.2, 323)
		const factor = .8
		const S06 = new S06BallSync(pos, factor, velo)
		const buff = S06.serialize()
		const S06Back = packetBuilder.deserializeS(buff)

		expect(S06Back?.time).toEqual(S06.time)
		expect(S06Back).toBeInstanceOf(S06BallSync)
		if (S06Back instanceof S06BallSync) {
			expect(S06Back.getPos().equals(S06.getPos())).toBe(true)
			expect(S06Back.getVelo().equals(S06.getVelo())).toBe(true)
		} else {
			throw new Error('Packet is not S06BallSync')
		}
	})
})
