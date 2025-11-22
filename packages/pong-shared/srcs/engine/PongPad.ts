import { Segment } from '../math/Segment.js'
import { Vector2 } from '../math/Vector2.js'

export enum padDirection {
	UP = 1,
	DOWN = -1
}

// NOTE: be carefull with references to Vec2 in Segments (don't forget `.clone()`)
export class PongPad {
	constructor(private seg: Segment[]) {}

	public move(dir: padDirection, incr: number) {
		this.seg.forEach((s) => {
			s.getP1().add(new Vector2(0, incr * dir))
			s.getP2().add(new Vector2(0, incr * dir))
		})
	}
}
