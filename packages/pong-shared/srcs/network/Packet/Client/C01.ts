import { Vector2 } from "@packages/pong-shared/srcs/math/Vector2.js"
import { IC00PongBase } from "./C00.js"

export class C01Move implements IC00PongBase {
	time: number
	private newCoord: Vector2
	constructor(coord: Vector2) {
		this.time = Date.now()
		this.newCoord = coord
	}

	getTime(): number {
		return this.time
	}

	getCoord(): Vector2 {
		return this.newCoord
	}

	serialize(): ArrayBuffer {
		// TODO: implement
		return new ArrayBuffer()
	}
}
