import { AShape } from '../../math/shapes/AShape'
import { Vector2 } from '../../math/Vector2'

export class PongObject {
	private origin: Vector2
	private velocity: Vector2
	private hitbox: AShape[] = []

	constructor(
		hitbox: AShape | AShape[],
		origin: Vector2 = new Vector2(),
		velocity: Vector2 = new Vector2()
	) {
		if (Array.isArray(hitbox)) {
			this.hitbox = hitbox
		} else {
			this.hitbox = [hitbox]
		}
		this.origin = origin
		this.velocity = velocity
	}

	getVelocity(): Vector2 {
		return this.velocity
	}

	getHitbox(): AShape[] {
		return this.hitbox
	}

	getOrigin(): Vector2 {
		return this.origin
	}

	static clone(obj: PongObject) {
		return new PongObject(obj.getHitbox(), obj.getOrigin(), obj.getVelocity())
	}

	clone() {
		return PongObject.clone(this)
	}
}
