import { C01Move } from './C01'
import { CPacketsType } from '../packetBuilder.js'
import { padDirection } from '../../../engine/PongPad'

describe('c01', () => {
	test('serialize returns correct buffer', () => {
		const time = Date.now()

		const C01Start = new C01Move(true, padDirection.DOWN, time)

		const viewStart = new DataView(C01Start.serialize())

		expect(viewStart.getFloat64(0, true)).toBeCloseTo(C01Start.getTime())
		expect(viewStart.getUint8(8)).toBe(CPacketsType.C01)

		expect(viewStart.getUint8(9) & 0b10).toEqual(0b10)
		expect(viewStart.getUint8(9) & 0b01).toEqual(0b00)

		const C01Stop = new C01Move(false, padDirection.UP, time)
		const viewStop = new DataView(C01Stop.serialize())
		expect(viewStop.getUint8(9) & 0b01).toEqual(0b01)
		expect(viewStop.getUint8(9) & 0b10).toEqual(0b00)
	})
})
