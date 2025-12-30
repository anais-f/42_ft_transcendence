import { Segment } from '../math/Segment.js'
import { Vector2 } from '../math/Vector2.js'

export enum padDirection {
	UP = 1,
	DOWN = -1
}

// NOTE: be carefull with references to Vec2 in Segments (don't forget `.clone()`)
export class PongPad {
	private _velocity: Vector2 = new Vector2(0, 0)

	constructor(
		private seg: Segment[],
		private border: Segment[] | null
	) {}

	public move(dir: padDirection, incr: number) {
		const dist = incr * dir
		const offset = new Vector2(0, dist)

		for (const s of this.seg) {
			s.p1.add(offset)
			s.p2.add(offset)
		}

		const blocked = this.border?.some((b) =>
			this.seg.some((s) => b.intersect(s))
		)
		if (blocked) {
			const reverseOffset = new Vector2(0, -dist)
			for (const s of this.seg) {
				s.p1.add(reverseOffset)
				s.p2.add(reverseOffset)
			}
			this._velocity = new Vector2(0, 0)
		} else {
			this._velocity = new Vector2(0, dist)
		}
	}

	public clearVelocity(): void {
		this._velocity = new Vector2(0, 0)
	}

	get velocity(): Vector2 {
		return this._velocity
	}

	get segments(): Segment[] {
		return this.seg
	}
}
