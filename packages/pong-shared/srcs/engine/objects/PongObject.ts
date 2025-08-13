import { Shape } from '../../math/shapes/Shape'
import { Vector2 } from '../../math/Vector2'

export class PongObject {
	private origin: Vector2
	private hitbox: Shape[] = []
	constructor(hitbox: Shape | Shape[], origin: Vector2 = new Vector2()) {
		if (Array.isArray(hitbox)) {
			this.hitbox = hitbox
		} else {
			this.hitbox = [hitbox]
		}
		this.origin = origin
	}
	getHitbox(): Shape[] {
		return this.hitbox
	}
	getOrigin(): Vector2 {
		return this.origin
	}
}
