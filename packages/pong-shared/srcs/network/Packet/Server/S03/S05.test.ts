import { Vector2 } from '../../../../math/Vector2.js'
import { NETWORK_PRECISION } from '../../../../config.js'
import { packetBuilder } from '../../packetBuilder.js'
import { SPacketsType } from '../../packetTypes.js'
import { AS03BaseBall } from './S03.js'
import { S05BallPos } from './S05.js'

describe('S05', () => {
	// Use realistic game values (ball position in arena -20 to 20)
	test('serialize returns correct buffer', () => {
		const pos = new Vector2(12.34, -8.5)
		const S03 = AS03BaseBall.createS03()
		const S05 = new S05BallPos(S03, pos)
		const buff = S05.serialize()

		expect(buff.byteLength).toBe(5)

		const view = new DataView(buff)
		const type = view.getUint8(0)
		const x = view.getInt16(1, true) / NETWORK_PRECISION
		const y = view.getInt16(3, true) / NETWORK_PRECISION

		expect(type).toBe(SPacketsType.S05)
		expect(x).toBeCloseTo(pos.x, 2)
		expect(y).toBeCloseTo(pos.y, 2)
	})

	test('deserialize', () => {
		const buff = new ArrayBuffer(5)
		const view = new DataView(buff)
		const pos = new Vector2(15.55, -7.23)

		view.setUint8(0, SPacketsType.S05)
		view.setInt16(1, Math.round(pos.x * NETWORK_PRECISION), true)
		view.setInt16(3, Math.round(pos.y * NETWORK_PRECISION), true)

		const p = packetBuilder.deserializeS(buff)
		expect(p).toBeInstanceOf(S05BallPos)
		if (p instanceof S05BallPos) {
			expect(p.pos.equals(pos)).toBe(true)
		} else {
			throw new Error('Packet is not S05BallPos')
		}
	})

	test('serialize + deserialize', () => {
		const v = new Vector2(5.67, -2.89)
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

	test('precision is maintained', () => {
		const pos = new Vector2(-18.99, 9.01)
		const S03 = AS03BaseBall.createS03()
		const S05 = new S05BallPos(S03, pos)
		const buff = S05.serialize()
		const S05Back = packetBuilder.deserializeS(buff) as S05BallPos

		expect(S05Back.pos.x).toBeCloseTo(pos.x, 2)
		expect(S05Back.pos.y).toBeCloseTo(pos.y, 2)
	})
})
