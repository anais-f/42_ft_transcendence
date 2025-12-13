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

		const type = view.getUint8(0)
		const vx = view.getFloat64(1, true)
		const vy = view.getFloat64(9, true)
		const f = view.getFloat64(17, true)
		const px = view.getFloat64(25, true)
		const py = view.getFloat64(33, true)

		expect(type).toBe(0b11101)
		expect(vx).toBeCloseTo(velo.x)
		expect(vy).toBeCloseTo(velo.y)
		expect(px).toBeCloseTo(pos.x)
		expect(py).toBeCloseTo(pos.y)
		expect(f).toBeCloseTo(factor)
	})

	test('deserialize', () => {
		const buff = new ArrayBuffer(41)
		const view = new DataView(buff)
		const type = 0b11101
		const v = new Vector2(324.32, -42)
		const pos = new Vector2(32.3, 3)
		const factor = 0.8

		view.setUint8(0, type)
		view.setFloat64(1, v.x, true)
		view.setFloat64(9, v.y, true)
		view.setFloat64(17, factor, true)

		view.setFloat64(25, pos.x, true)
		view.setFloat64(33, pos.y, true)

		const p = packetBuilder.deserializeS(buff)
		expect(p).toBeInstanceOf(S06BallSync)
		if (p instanceof S06BallSync) {
			expect(p.velo.equals(v)).toBe(true)
			expect(p.pos.equals(pos)).toBe(true)
		} else {
			throw new Error('Packet is not S06BallSync')
		}
	})

	test('serialize + deserialize', () => {
		const pos = new Vector2(-23.322, -34)
		const velo = new Vector2(23.2, 323)
		const factor = 0.8
		const S06 = new S06BallSync(pos, factor, velo)
		const buff = S06.serialize()
		const S06Back = packetBuilder.deserializeS(buff)

		expect(S06Back).toBeInstanceOf(S06BallSync)
		if (S06Back instanceof S06BallSync) {
			expect(S06Back.pos.equals(S06.pos)).toBe(true)
			expect(S06Back.velo.equals(S06.velo)).toBe(true)
		} else {
			throw new Error('Packet is not S06BallSync')
		}
	})
})
