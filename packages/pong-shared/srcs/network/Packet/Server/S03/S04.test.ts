import { Vector2 } from '../../../../math/Vector2.js'
import { packetBuilder } from '../../packetBuilder.js'
import { SPacketsType } from '../../packetTypes.js'
import { AS03BaseBall } from './S03.js'
import { S04BallVeloChange } from './S04.js'

describe('S04', () => {
	test('serialize returns correct buffer', () => {
		const velo = new Vector2(497.34, -232)
		const S03 = AS03BaseBall.createS03()
		const S04 = new S04BallVeloChange(S03, velo, 1)
		const buff = S04.serialize()

		const view = new DataView(buff)

		const type = view.getUint8(0)
		const x = view.getFloat64(1, true)
		const y = view.getFloat64(9, true)

		expect(type).toBe(SPacketsType.S04)
		expect(x).toBeCloseTo(velo.x)
		expect(y).toBeCloseTo(velo.y)
	})

	test('deserialize', () => {
		const buff = new ArrayBuffer(25)
		const view = new DataView(buff)
		const v = new Vector2(324.32, -42)
		const factor: number = 0.8

		view.setUint8(0, SPacketsType.S04)
		view.setFloat64(1, v.x, true)
		view.setFloat64(9, v.y, true)
		view.setFloat64(17, factor, true)

		const p = packetBuilder.deserializeS(buff)
		expect(p).toBeInstanceOf(S04BallVeloChange)
		if (!(p instanceof S04BallVeloChange)) {
			throw '...'
		}
		expect(p.velo.equals(v)).toBe(true)
		expect(p.factor).toBeCloseTo(factor)
	})

	test('serialize + deserialize', () => {
		const v = new Vector2(23, -2)
		const S03 = AS03BaseBall.createS03()
		const S04 = new S04BallVeloChange(S03, v, 0.8)
		const buff = S04.serialize()
		const S04Back = packetBuilder.deserializeS(buff)

		expect(S04Back).toBeInstanceOf(S04BallVeloChange)
		if (S04Back instanceof S04BallVeloChange) {
			expect(S04Back.velo.equals(S04.velo)).toBe(true)
		} else {
			throw new Error('Packet is not S04BallVeloChange')
		}
	})
})
