import { Vector2 } from '@packages/pong-shared/srcs/math/Vector2.js'
import { IS00PongBase } from '../S00.js'
import { S03BaseBall } from './S03.js'
import { S05BallPos } from './S05.js'
import { S04BallVeloChange } from './S04.js'

export class S06BallSync extends S03BaseBall implements IS00PongBase {
	private S05: S05BallPos
	private S04: S04BallVeloChange

	constructor(pos: Vector2, velo: Vector2, ts: number | null = null) {
		const S03 = ts === null ? S03BaseBall.createS03() : new S03BaseBall(ts)

		super(S03.getTime())
		this.S04 = new S04BallVeloChange(S03, velo)
		this.S05 = new S05BallPos(S03, pos)
	}

	getPos(): Vector2 {
		return this.S05.getPos()
	}

	getVelo(): Vector2 {
		return this.S04.getVelo()
	}

	getTime(): number {
		return this.S04.getTime()
	}

	serialize(): ArrayBuffer {
		const fake = this.fserialize()
		const buff = new ArrayBuffer(41)

		const fakeUint8 = new Uint8Array(fake)
		const buffUint8 = new Uint8Array(buff)

		buffUint8.set(fakeUint8)

		buffUint8[8] |= 0b11000

		const view = new DataView(buff)
		view.setFloat64(9, this.getVelo().getX(), true)
		view.setFloat64(17, this.getVelo().getY(), true)
		view.setFloat64(25, this.getPos().getX(), true)
		view.setFloat64(33, this.getPos().getY(), true)

		return buff
	}
}
