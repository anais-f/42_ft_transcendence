import { Vector2 } from '../../../../math/Vector2.js'
import { NETWORK_PRECISION } from '../../../../config.js'
import { packetBuilder } from '../../packetBuilder.js'
import { SPacketsType } from '../../packetTypes.js'
import { S06BallSync } from './S06.js'

describe('S06', () => {
	// Use realistic game values
	test('serialize returns correct buffer', () => {
		const pos = new Vector2(5.5, -3.2)
		const velo = new Vector2(-0.8, 0.6)
		const factor = 0.4
		const S06 = new S06BallSync(pos, factor, velo)
		const buff = S06.serialize()

		expect(buff.byteLength).toBe(11)

		const view = new DataView(buff)
		const type = view.getUint8(0)
		const vx = view.getInt16(1, true) / NETWORK_PRECISION
		const vy = view.getInt16(3, true) / NETWORK_PRECISION
		const f = view.getInt16(5, true) / NETWORK_PRECISION
		const px = view.getInt16(7, true) / NETWORK_PRECISION
		const py = view.getInt16(9, true) / NETWORK_PRECISION

		expect(type).toBe(SPacketsType.S06)
		expect(vx).toBeCloseTo(velo.x, 2)
		expect(vy).toBeCloseTo(velo.y, 2)
		expect(px).toBeCloseTo(pos.x, 2)
		expect(py).toBeCloseTo(pos.y, 2)
		expect(f).toBeCloseTo(factor, 2)
	})

	test('deserialize', () => {
		const buff = new ArrayBuffer(11)
		const view = new DataView(buff)
		const velo = new Vector2(0.75, -0.66)
		const pos = new Vector2(12.3, -5.5)
		const factor = 0.8

		view.setUint8(0, SPacketsType.S06)
		view.setInt16(1, Math.round(velo.x * NETWORK_PRECISION), true)
		view.setInt16(3, Math.round(velo.y * NETWORK_PRECISION), true)
		view.setInt16(5, Math.round(factor * NETWORK_PRECISION), true)
		view.setInt16(7, Math.round(pos.x * NETWORK_PRECISION), true)
		view.setInt16(9, Math.round(pos.y * NETWORK_PRECISION), true)

		const p = packetBuilder.deserializeS(buff)
		expect(p).toBeInstanceOf(S06BallSync)
		if (p instanceof S06BallSync) {
			expect(p.velo.equals(velo)).toBe(true)
			expect(p.pos.equals(pos)).toBe(true)
			expect(p.factor).toBeCloseTo(factor, 2)
		} else {
			throw new Error('Packet is not S06BallSync')
		}
	})

	test('serialize + deserialize', () => {
		const pos = new Vector2(-10.5, 8.2)
		const velo = new Vector2(0.5, -0.86)
		const factor = 1.05
		const S06 = new S06BallSync(pos, factor, velo)
		const buff = S06.serialize()
		const S06Back = packetBuilder.deserializeS(buff)

		expect(S06Back).toBeInstanceOf(S06BallSync)
		if (S06Back instanceof S06BallSync) {
			expect(S06Back.pos.equals(S06.pos)).toBe(true)
			expect(S06Back.velo.equals(S06.velo)).toBe(true)
			expect(S06Back.factor).toBeCloseTo(S06.factor, 2)
		} else {
			throw new Error('Packet is not S06BallSync')
		}
	})

	test('precision is maintained', () => {
		const pos = new Vector2(-18.99, 9.01)
		const velo = new Vector2(0.87, -0.49)
		const factor = 0.52
		const S06 = new S06BallSync(pos, factor, velo)
		const buff = S06.serialize()
		const S06Back = packetBuilder.deserializeS(buff) as S06BallSync

		expect(S06Back.pos.x).toBeCloseTo(pos.x, 2)
		expect(S06Back.pos.y).toBeCloseTo(pos.y, 2)
		expect(S06Back.velo.x).toBeCloseTo(velo.x, 2)
		expect(S06Back.velo.y).toBeCloseTo(velo.y, 2)
		expect(S06Back.factor).toBeCloseTo(factor, 2)
	})
})
