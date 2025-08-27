import { AShape } from '../../math/shapes/AShape'
import { Vector2 } from '../../math/Vector2'

export class PongObject {
	private origin: Vector2
	private velocity: Vector2
	private hitbox: AShape[] = []

	public constructor(
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

	public getVelocity(): Vector2 {
		return this.velocity
	}

	public getHitbox(): AShape[] {
		return this.hitbox
	}

	public getOrigin(): Vector2 {
		return this.origin
	}

	public setOrigin(o: Vector2) {
		this.origin = o
	}

	public static clone(obj: PongObject): PongObject{
		const dupHitbox = obj.getHitbox().map((h) => h.clone())
		return new PongObject(dupHitbox, obj.getOrigin().clone(), obj.getVelocity().clone())
	}

	public clone() {
		return PongObject.clone(this)
	}

	public intersect(other: PongObject): boolean {
		const createAbsHitbox = (hitbox: AShape, origin: Vector2) => {
			const clonedHitbox = hitbox.clone()
			clonedHitbox.setOrigin(origin.clone())
			return clonedHitbox
		}

		const absLocalHitbox = this.hitbox.map(h => createAbsHitbox(h, this.origin))
		const absOtherHitbox = other.getHitbox().map(h => createAbsHitbox(h, other.getOrigin()))

		for (let localObj of absLocalHitbox) {
			for (let otherObj of absOtherHitbox) {
				if (otherObj.intersect(localObj)) {
					return true
				}
			}
		}
		return false
	}

}
