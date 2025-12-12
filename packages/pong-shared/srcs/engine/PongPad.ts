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
		for (const s of this.seg) {
			const dist = incr * dir
			s.getP1().add(new Vector2(0, dist))
			s.getP2().add(new Vector2(0, dist))
			if (this.border?.some((b) => b.intersect(s))) {
				s.getP1().add(new Vector2(0, -dist))
				s.getP2().add(new Vector2(0, -dist))
				break
			}
		}
	}
}
