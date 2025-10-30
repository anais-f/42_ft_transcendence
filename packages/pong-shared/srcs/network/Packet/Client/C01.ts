import { Vector2 } from '@packages/pong-shared/srcs/math/Vector2.js'
import { IC00PongBase } from './C00.js'

export class C01Move implements IC00PongBase {
	private dir: Vector2
	constructor(
		coord: Vector2,
		public time = Date.now()
	) {
		this.dir = coord
	}

	getTime(): number {
		return this.time
	}

	getDirection(): Vector2 {
		return this.dir
	}

	/*
	 * timestamp start at 0
	 * type start at 8
	 * x start at 9
	 * y start at 17
	 */
	serialize(): ArrayBuffer {
		const buff = new ArrayBuffer(25) // 8 + 1 + 8 + 8
		const view = new DataView(buff)

		view.setFloat64(0, this.time, true) // timestamp [0 - 7]
		view.setUint8(8, 0b11) // type [8]
		view.setFloat64(9, this.dir.getX(), true) // x [9 - 16]
		view.setFloat64(17, this.dir.getY(), true) // y [17 - end]

		return buff
	}
}
