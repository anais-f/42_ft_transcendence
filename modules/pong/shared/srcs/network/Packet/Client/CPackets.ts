
import { Vector2 } from "../../../math/Vector2"

interface IC00PongBase {
	time: number

	getTime(): number
	
	serialize(): Uint8Array
}

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

	serialize(): Uint8Array {
		// TODO: implement
		return new Uint8Array
	}

}

export class C03BallBase {
	time: number

	constructor(time: number) {
		this.time = time
	}

	getTime(): number {
		return this.time
	}

	static createC03() {
		return new C03BallBase(Date.now())
	}
}

export class C04BallVelo extends C03BallBase implements IC00PongBase {
	private velo: Vector2

	constructor(C03: C03BallBase, velo: Vector2) {
		super(C03.getTime())
		this.velo = velo
	}

	getVelo(): Vector2 {
		return this.velo
	}
	
	serialize(): Uint8Array {
		// TODO: implement
		return new Uint8Array
	}
}

export class C05BallPos extends C03BallBase implements IC00PongBase {
	private pos: Vector2

	constructor(C03: C03BallBase, pos: Vector2) {
		super(C03.getTime())
		this.pos = pos
	}


	getPos(): Vector2 {
		return this.pos
	}
	
	serialize(): Uint8Array {
		// TODO: implement
		return new Uint8Array
	}
}

export class C06BallVeloPos extends C03BallBase implements IC00PongBase {
	private C05: C05BallPos
	private C04: C04BallVelo

	constructor(pos: Vector2, velo: Vector2) {
		const C03 = C03BallBase.createC03()

		super(C03.getTime())
		this.C04 = new C04BallVelo(C03, velo)
		this.C05 = new C05BallPos(C03, pos)
	}

	getPos(): Vector2 {
		return this.C05.getPos()
	}

	getVelo(): Vector2 {
		return this.C04.getVelo()
	}

	getTime(): number {
		return this.C04.getTime()
	}

	serialize(): Uint8Array {
		// TODO: implement
		return new Uint8Array
	}
}
