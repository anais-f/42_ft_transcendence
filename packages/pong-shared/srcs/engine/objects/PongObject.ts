import { AShape } from '../../math/shapes/AShape.js'
import { Circle } from '../../math/shapes/Circle.js'
import { Polygon } from '../../math/shapes/Polygon.js'
import { Vector2 } from '../../math/Vector2.js'

export class PongObject {
	private origin: Vector2
	private velocity: Vector2 // maybe deprecated
	private hitbox: AShape[] = []
	public bufferSize

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

		let size = 16 + 1
		for (const lhitbox of this.hitbox) {
			if (lhitbox instanceof Circle) {
				size += 25
			} else if (lhitbox instanceof Polygon) {
				size += 18 + 16 * lhitbox.getSegment().length
			}
		}
		this.bufferSize = size
	}

	public applyVelo() {
		this.origin.setXY(
			this.origin.getX() + this.velocity.getX(),
			this.origin.getY() + this.velocity.getY()
		)
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

	public static clone(obj: PongObject): PongObject {
		const dupHitbox = obj.getHitbox().map((h) => h.clone())
		return new PongObject(
			dupHitbox,
			obj.getOrigin().clone(),
			obj.getVelocity().clone()
		)
	}

	public clone() {
		return PongObject.clone(this)
	}

	public intersect(other: PongObject): Vector2[] | null {
		const createAbsHitbox = (hitbox: AShape, origin: Vector2) => {
			const clonedHitbox = hitbox.clone()
			clonedHitbox.addToOrigin(origin.clone())
			return clonedHitbox
		}

		const absLocalHitbox = this.hitbox.map((h) =>
			createAbsHitbox(h, this.origin)
		)
		const absOtherHitbox = other
			.getHitbox()
			.map((h) => createAbsHitbox(h, other.getOrigin()))

		let hitpoints: Vector2[] = []
		for (let localObj of absLocalHitbox) {
			for (let otherObj of absOtherHitbox) {
				const hp = otherObj.intersect(localObj)
				if (hp instanceof Array) {
					hitpoints = [...hitpoints, ...hp]
				}
			}
		}
		if (hitpoints.length === 0) {
			return null
		}
		return hitpoints.filter(
			(pt, idx, arr) => arr.findIndex((other) => pt.equals(other)) === idx
		)
	}
	//
	// nb obj 1o
	// [ obj
	//  type 1o
	//  origin: 16o
	//
	//  circle:
	//      rad 8o
	//
	//  poly:
	//      nb point 1o [1-255]
	//      each point = 16o
	// ]
	//
	public serialize(): ArrayBuffer {
		// split hitboxs
		const circles = this.hitbox.filter((i) => i instanceof Circle)
		const polys = this.hitbox.filter((i) => i instanceof Polygon)

		// - each circle : 1 (type) + 16 (origin) + 8 (rad) = 25 octets
		// - each poly : 1 (type) + 16 (origin) + 1 (nb pts) + 16 * nb pts

		const circlesBuff = new ArrayBuffer(circles.length * 25)
		const viewCircle = new DataView(circlesBuff)

		let polySize = 0
		for (const p of polys) {
			polySize += 18 + 16 * p.getSegment().length
		}
		const polyBuff = new ArrayBuffer(polySize)
		const viewPoly = new DataView(polyBuff)

		let offset = 0
		for (const circle of circles) {
			const pos = circle.getOrigin()
			const rad = circle.getRad()
			const localoffset = offset * 25
			viewCircle.setUint8(0 + localoffset, 1)
			viewCircle.setFloat64(1 + localoffset, pos.getX(), true)
			viewCircle.setFloat64(9 + localoffset, pos.getY(), true)
			viewCircle.setFloat64(17 + localoffset, rad, true)
			++offset
		}
		offset = 0
		let polyOffset = 0
		for (const p of polys) {
			const o = p.getOrigin()
			const segs = p.getSegment()
			viewPoly.setUint8(polyOffset, 2) // type
			viewPoly.setFloat64(polyOffset + 1, o.getX(), true)
			viewPoly.setFloat64(polyOffset + 9, o.getY(), true)
			viewPoly.setUint8(polyOffset + 17, segs.length)

			let pointsOffset = polyOffset + 18
			for (const seg of segs) {
				const point = seg.getP1()
				viewPoly.setFloat64(pointsOffset, point.getX(), true)
				viewPoly.setFloat64(pointsOffset + 8, point.getY(), true)
				pointsOffset += 16
			}
			polyOffset += 18 + 16 * segs.length
		}

		// Buffer
		const totalSize = 17 + circlesBuff.byteLength + polyBuff.byteLength // nbObj (1 octet) + circle + polys
		const finalBuff = new ArrayBuffer(totalSize)
		const viewFinal = new DataView(finalBuff)

		// fill last buff
		offset = 0
		viewFinal.setFloat64(offset, this.origin.getX(), true)
		viewFinal.setFloat64(offset + 8, this.origin.getY(), true)
		offset += 16
		viewFinal.setUint8(offset, this.hitbox.length)
		offset += 1

		new Uint8Array(finalBuff, offset, circlesBuff.byteLength).set(
			new Uint8Array(circlesBuff)
		)
		offset += circlesBuff.byteLength
		new Uint8Array(finalBuff, offset, polyBuff.byteLength).set(
			new Uint8Array(polyBuff)
		)

		return finalBuff
	}

	static deserialize(buffer: ArrayBuffer): PongObject {
		const view = new DataView(buffer)
		let offset = 0

		const originX = view.getFloat64(offset, true)
		offset += 8
		const originY = view.getFloat64(offset, true)
		offset += 8
		const objectOrigin = new Vector2(originX, originY)

		const nbHitbox = view.getUint8(offset)
		offset += 1

		const hitboxes: AShape[] = []

		for (let i = 0; i < nbHitbox; ++i) {
			const type = view.getUint8(offset)
			offset += 1

			const hx = view.getFloat64(offset, true)
			offset += 8
			const hy = view.getFloat64(offset, true)
			offset += 8
			const hOrigin = new Vector2(hx, hy)

			if (type === 1) {
				// Circle (rad)
				const rad = view.getFloat64(offset, true)
				offset += 8
				hitboxes.push(new Circle(hOrigin, rad))
			} else if (type === 2) {
				// Polygon
				const numPoints = view.getUint8(offset)
				offset += 1
				const points: Vector2[] = []
				for (let j = 0; j < numPoints; ++j) {
					const px = view.getFloat64(offset, true)
					offset += 8
					const py = view.getFloat64(offset, true)
					offset += 8
					points.push(new Vector2(px, py))
				}
				hitboxes.push(new Polygon(points, hOrigin))
			} else {
				throw new Error(`Unknown hitbox type: ${type}`)
			}
		}

		return new PongObject(hitboxes, objectOrigin)
	}
}
