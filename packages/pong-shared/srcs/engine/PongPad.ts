import { Segment } from '../math/Segment.js'
import { Vector2 } from '../math/Vector2.js'

export enum padDirection {
	UP = 1,
	DOWN = -1
}

// NOTE: be carefull with references to Vec2 in Segments (don't forget `.clone()`)
export class PongPad {
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
		}
	}
}
