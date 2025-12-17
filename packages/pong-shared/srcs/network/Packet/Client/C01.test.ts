import { C01Move } from './C01.js'
import { padDirection } from '../../../engine/PongPad.js'
import { CPacketsType } from '../packetTypes.js'
import { packetBuilder } from '../packetBuilder.js'

describe('c01', () => {
	test('serialize returns correct buffer', () => {
		const C01Start = new C01Move(true, padDirection.DOWN)

		const viewStart = new DataView(C01Start.serialize())

		expect(viewStart.getUint8(0)).toBe(CPacketsType.C01)

		expect(viewStart.getUint8(1) & 0b10).toEqual(0b10)
		expect(viewStart.getUint8(1) & 0b01).toEqual(0b00)

		const C01Stop = new C01Move(false, padDirection.UP)
		const viewStop = new DataView(C01Stop.serialize())
		expect(viewStop.getUint8(1) & 0b01).toEqual(0b01)
		expect(viewStop.getUint8(1) & 0b10).toEqual(0b00)
	})

	test('serialize test all', () => {
		const cases = [
			{
				state: true,
				dir: padDirection.UP,
				expectStartMask: 0b10,
				expectDirMask: 0b01
			},
			{
				state: true,
				dir: padDirection.DOWN,
				expectStartMask: 0b10,
				expectDirMask: 0b00
			},
			{
				state: false,
				dir: padDirection.UP,
				expectStartMask: 0b00,
				expectDirMask: 0b01
			},
			{
				state: false,
				dir: padDirection.DOWN,
				expectStartMask: 0b00,
				expectDirMask: 0b00
			}
		]

		for (const c of cases) {
			const pkt = new C01Move(c.state, c.dir)
			const view = new DataView(pkt.serialize())
			const data = view.getUint8(1)

			expect(data & 0b10).toEqual(c.expectStartMask)
			expect(data & 0b01).toEqual(c.expectDirMask)
		}
	})

	test('serialize + deserialize', () => {
		const dir = padDirection.UP
		const original = new C01Move(true, dir)
		const buff = original.serialize()

		const reconstructed = packetBuilder.deserializeC(buff)
		expect(reconstructed).toBeInstanceOf(C01Move)
		if (!(reconstructed instanceof C01Move)) {
			throw '...'
		}

		expect(reconstructed.state).toBe(original.state)
		expect(reconstructed.dir).toBe(original.dir)
	})
})
