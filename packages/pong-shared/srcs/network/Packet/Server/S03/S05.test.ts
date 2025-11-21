import { Vector2 } from '../../../../math/Vector2.js'
import { S03BaseBall } from './S03.js'
import { S05BallPos } from './S05.js'

describe('S05', () => {
	test('serialize returns correct buffer', () => {
		const velo = new Vector2(497.34, -232)
		const S03 = S03BaseBall.createS03()
		const S04 = new S05BallPos(S03, velo)
		const buff = S04.serialize()

		const view = new DataView(buff)

		const ts = view.getFloat64(0, true)
		const type = view.getUint8(8)
		const x = view.getFloat64(9, true)
		const y = view.getFloat64(17, true)

		expect(typeof ts).toBe('number')
		expect(ts).toBeCloseTo(S03.time)
		expect(ts).toBeCloseTo(S04.time)
		expect(type).toBe(0b10101)
		expect(x).toBeCloseTo(velo.getX())
		expect(y).toBeCloseTo(velo.getY())
	})
	/*

	test('deserialize', () => {
		const buff = new ArrayBuffer(25)
		const view = new DataView(buff)
		const timestamp = 123456.789
		const type = 0b10101
		const pos = new Vector2(324.32, -42)

		view.setFloat64(0, timestamp, true)
		view.setUint8(8, type)
		view.setFloat64(9, pos.getX(), true)
		view.setFloat64(17, pos.getY(), true)

		const p = packetBuilder.deserializeS(buff)
		expect(p).toBeInstanceOf(S05BallPos)
		expect(p?.time).toBeCloseTo(timestamp)
		if (p instanceof S05BallPos) {
			expect(p.getPos().equals(pos)).toBe(true)
		} else {
			throw new Error('Packet is not S05BallPos')
		}
	})

	test('serialize + deserialize', () => {
		const v = new Vector2(23, -2)
		const S03 = S03BaseBall.createS03()
		const S05 = new S05BallPos(S03, v)
		const buff = S05.serialize()
		const S05Back = packetBuilder.deserializeS(buff)

		expect(S05Back?.time).toEqual(S03.time)
		expect(S05Back).toBeInstanceOf(S05BallPos)
		if (S05Back instanceof S05BallPos) {
			expect(S05Back.getPos().equals(S05.getPos())).toBe(true)
		} else {
			throw new Error('Packet is not S05BallPos')
		}
	})
	*/
})
