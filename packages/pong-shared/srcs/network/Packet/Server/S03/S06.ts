import { Vector2 } from '@packages/pong-shared/srcs/math/Vector2.js'
import { IS00PongBase } from '../S00.js'
import { SPacketsType } from '../../packetTypes.js'
import { AS03BaseBall } from './S03.js'
import { S05BallPos } from './S05.js'
import { S04BallVeloChange } from './S04.js'

export class S06BallSync extends AS03BaseBall implements IS00PongBase {
	private S05: S05BallPos
	private S04: S04BallVeloChange

	constructor(pos: Vector2, factor: number, velo: Vector2) {
		const S03 = AS03BaseBall.createS03()

		super()
		this.S04 = new S04BallVeloChange(S03, velo, factor)
		this.S05 = new S05BallPos(S03, pos)
	}

	getPos(): Vector2 {
		return this.S05.getPos()
	}

	getVelo(): Vector2 {
		return this.S04.getVelo()
	}

	getFactor(): number {
		return this.S04.getFactor()
	}

	serialize(): ArrayBuffer {
		const fake = this.fserialize()
		const buff = new ArrayBuffer(41)

		const fakeUint8 = new Uint8Array(fake)
		const buffUint8 = new Uint8Array(buff)

		buffUint8.set(fakeUint8)

		buffUint8[0] |= SPacketsType.S06

		const view = new DataView(buff)
		view.setFloat64(1, this.getVelo().getX(), true)
		view.setFloat64(9, this.getVelo().getY(), true)
		view.setFloat64(17, this.getFactor(), true)
		view.setFloat64(25, this.getPos().getX(), true)
		view.setFloat64(33, this.getPos().getY(), true)

		return buff
	}
}
