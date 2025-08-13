import { Vector2 } from '../../../math/Vector2'

export interface IS00PongBase {
	time: number
	getTime(): number
	serialize(): Uint8Array
}

export class S01ServerTickConfirmation implements IS00PongBase {
	time: number

	constructor() {
		this.time = Date.now()
	}

	getTime(): number {
		return this.time
	}

	serialize(): Uint8Array {
		// TODO: implement
		return new Uint8Array()
	}
}

export class S03BaseBall {
	time: number

	constructor(time: number) {
		this.time = time
	}

	getTime(): number {
		return this.time
	}

	static createS03() {
		return new S03BaseBall(Date.now())
	}
}

export class S04BallVeloChange extends S03BaseBall implements IS00PongBase {
	private velo: Vector2

	constructor(S03: S03BaseBall, velo: Vector2) {
		super(S03.getTime())
		this.velo = velo
	}

	getVelo(): Vector2 {
		return this.velo
	}

	serialize(): Uint8Array {
		// TODO: implement
		return new Uint8Array()
	}
}

export class S05BallPos extends S03BaseBall implements IS00PongBase {
	private pos: Vector2

	constructor(S03: S03BaseBall, pos: Vector2) {
		super(S03.getTime())
		this.pos = pos
	}

	getPos(): Vector2 {
		return this.pos
	}

	serialize(): Uint8Array {
		// TODO: implement
		return new Uint8Array()
	}
}

export class S06BallSync extends S03BaseBall implements IS00PongBase {
	private S05: S05BallPos
	private S04: S04BallVeloChange

	constructor(pos: Vector2, velo: Vector2) {
		const S03 = S03BaseBall.createS03()

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

	serialize(): Uint8Array {
		// TODO: implement
		return new Uint8Array()
	}
}
