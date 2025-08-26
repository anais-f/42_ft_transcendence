import { Vector2 } from '../../../math/Vector2'
import { Segment } from '../../../math/Segment'
import { Circle } from '../../../math/shapes/Circle'
import { Polygon } from '../../../math/shapes/Polygon'
import { PongMap } from '../Map'
import { World, WorldShape } from '../World'
import { Rectangle } from '../../../math/shapes/Rectangle'

export class WorldRect extends World {
	private rect: Rectangle = new Rectangle(
		new Vector2(-20, -10),
		new Vector2(40, 20)
	)

	public constructor() {
		super(WorldShape.Rectangle, new PongMap()) // empty map
	}

	public isInside(o: Vector2): boolean
	public isInside(o: Segment): boolean
	public isInside(o: Circle): boolean
	public isInside(o: Polygon): boolean

	public isInside(o: Vector2 | Segment | Circle | Polygon): boolean {
		if (o instanceof Vector2) {
			return this.isInsideVec2(o)
		} else if (o instanceof Segment) {
			return this.isInsideSeg(o)
		} else if (o instanceof Circle) {
			return this.isInsideCircle(o)
		} else if (o instanceof Polygon) {
			return this.isInsidePolygon(o)
		}
		throw 'Invalid type'
	}

	private isInsideVec2(o: Vector2): boolean {
		return this.rect.containsPoint(o)
	}

	private isInsideSeg(o: Segment): boolean {
		return this.isInsideVec2(o.getP1()) && this.isInsideVec2(o.getP2())
	}

	private isInsideCircle(o: Circle): boolean {
		const center = o.getOrigin()
		const rad = o.getRad()

		const absPoints = this.rect.getAbsolutePoints()
		const xs = absPoints.map((p) => p.getX())
		const ys = absPoints.map((p) => p.getY())
		const minX = Math.min(...xs)
		const maxX = Math.max(...xs)
		const minY = Math.min(...ys)
		const maxY = Math.max(...ys)

		return (
			center.getX() - rad >= minX - Number.EPSILON &&
			center.getX() + rad <= maxX + Number.EPSILON &&
			center.getY() - rad >= minY - Number.EPSILON &&
			center.getY() + rad <= maxY + Number.EPSILON
		)
	}

	private isInsidePolygon(o: Polygon): boolean {
		const absPoints = o.getAbsoluteSegments().map((seg) => seg.getP1())
		return absPoints.every((pt) => this.rect.containsPoint(pt))
	}
}
