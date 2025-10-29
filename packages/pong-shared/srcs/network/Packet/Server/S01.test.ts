import { S01ServerTickConfirmation as S01TC } from './S01.js'
describe('S01', () => {
	test('serialize returns correct buffer', () => {
		const S01 = new S01TC()
		const buff = S01.serialize()
		const view = new DataView(buff)

		const ts = view.getFloat64(0, true)
		expect(typeof ts).toBe('number')
		expect(ts).toBeCloseTo(S01.time)

		const type = view.getUint8(8)
		expect(type).toBe(0b11)
	})
})
