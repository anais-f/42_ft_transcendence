import { Vector2 } from '../../../../math/Vector2.js'
import { C03BallBase } from './C03.js'
import { IC00PongBase } from '../C00.js'

export class C05BallPos extends C03BallBase implements IC00PongBase {
	private pos: Vector2

	constructor(C03: C03BallBase, pos: Vector2) {
		super(C03.getTime())
		this.pos = pos
	}

	getPos(): Vector2 {
		return this.pos
	}

	serialize(): ArrayBuffer {
		const fake = this.fserialize()
		const buff = new ArrayBuffer(25)
		const fakeUint8 = new Uint8Array(fake)
		const buffUint8 = new Uint8Array(buff)

		buffUint8.set(fakeUint8)

		buffUint8[8] |= 0b10000

		const view = new DataView(buff)
		view.setFloat64(9, this.pos.getX(), true)
		view.setFloat64(17, this.pos.getY(), true)

		return buff
	}
}
