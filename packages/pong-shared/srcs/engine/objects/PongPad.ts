import { Vector2 } from '../../math/Vector2.js'
import { PongObject } from './PongObject.js'

export enum PadDirection {
	Up,
	Down
}

export class PongPad {
	public constructor(
		private player: number,
		private obj: PongObject
	) {}

	public getPlayer(): number {
		return this.player
	}

	public getObjs(): PongObject {
		return this.obj
	}

	public move(dir: PadDirection, incr: number, border: PongObject[]) {
		const pos = this.obj.getOrigin()
		switch (dir) {
			case PadDirection.Up:
				this.obj.setOrigin(Vector2.add(pos, new Vector2(0, incr)))
				break
			case PadDirection.Down:
				this.obj.setOrigin(Vector2.add(pos, new Vector2(0, incr)))
				break
		}
		for (const o of border) {
			if (o.intersect(this.obj)) {
				this.obj.setOrigin(pos.clone())
				break
			}
		}
	}
}
