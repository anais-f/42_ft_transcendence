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

		const ts = view.getFloat64(0, true)
		const type = view.getUint8(8)
		const x = view.getFloat64(9, true)
		const y = view.getFloat64(17, true)

		expect(typeof ts).toBe('number')
		expect(ts).toBeCloseTo(S03.time)
		expect(ts).toBeCloseTo(S04.time)
		expect(type).toBe(SPacketsType.S04)
		expect(x).toBeCloseTo(velo.getX())
		expect(y).toBeCloseTo(velo.getY())
	})

	test('deserialize', () => {
		const buff = new ArrayBuffer(33)
		const view = new DataView(buff)
		const timestamp = 123456.789
		const v = new Vector2(324.32, -42)
		const factor: number = 0.8

		view.setFloat64(0, timestamp, true)
		view.setUint8(8, SPacketsType.S04)
		view.setFloat64(9, v.getX(), true)
		view.setFloat64(17, v.getY(), true)
		view.setFloat64(25, factor, true)

		const p = packetBuilder.deserializeS(buff)
		expect(p).toBeInstanceOf(S04BallVeloChange)
		expect(p?.time).toBeCloseTo(timestamp)
		expect(p).toBeInstanceOf(S04BallVeloChange)
		if (!(p instanceof S04BallVeloChange)) {
			throw '...'
		}
		expect(p.getVelo().equals(v)).toBe(true)
		expect(p.getFactor()).toBeCloseTo(factor)
	})

	test('serialize + deserialize', () => {
		const v = new Vector2(23, -2)
		const S03 = AS03BaseBall.createS03()
		const S04 = new S04BallVeloChange(S03, v, 0.8)
		const buff = S04.serialize()
		const S04Back = packetBuilder.deserializeS(buff)

		expect(S04Back?.time).toEqual(S03.time)

		expect(S04Back).toBeInstanceOf(S04BallVeloChange)
		if (S04Back instanceof S04BallVeloChange) {
			expect(S04Back.getVelo().equals(S04.getVelo())).toBe(true)
		} else {
			throw new Error('Packet is not S04BallVeloChange')
		}
	})
})
