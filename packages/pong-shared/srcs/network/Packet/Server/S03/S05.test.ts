import { Vector2 } from '../../../../math/Vector2.js'
import { packetBuilder } from '../../packetBuilder.js'
import { AS03BaseBall } from './S03.js'
import { S05BallPos } from './S05.js'

describe('S05', () => {
	test('serialize returns correct buffer', () => {
		const velo = new Vector2(497.34, -232)
		const S03 = AS03BaseBall.createS03()
		const S04 = new S05BallPos(S03, velo)
		const buff = S04.serialize()

		const view = new DataView(buff)

		const type = view.getUint8(0)
		const x = view.getFloat64(1, true)
		const y = view.getFloat64(9, true)

		expect(type).toBe(0b10101)
		expect(x).toBeCloseTo(velo.x)
		expect(y).toBeCloseTo(velo.y)
	})

	test('deserialize', () => {
		const buff = new ArrayBuffer(17)
		const view = new DataView(buff)
		const type = 0b10101
		const pos = new Vector2(324.32, -42)

		view.setUint8(0, type)
		view.setFloat64(1, pos.x, true)
		view.setFloat64(9, pos.y, true)

		const p = packetBuilder.deserializeS(buff)
		expect(p).toBeInstanceOf(S05BallPos)
		if (p instanceof S05BallPos) {
			expect(p.pos.equals(pos)).toBe(true)
		} else {
			throw new Error('Packet is not S05BallPos')
		}
	})

	test('serialize + deserialize', () => {
		const v = new Vector2(23, -2)
		const S03 = AS03BaseBall.createS03()
		const S05 = new S05BallPos(S03, v)
		const buff = S05.serialize()
		const S05Back = packetBuilder.deserializeS(buff)

		expect(S05Back).toBeInstanceOf(S05BallPos)
		if (S05Back instanceof S05BallPos) {
			expect(S05Back.pos.equals(S05.pos)).toBe(true)
		} else {
			throw new Error('Packet is not S05BallPos')
		}
	})
})
