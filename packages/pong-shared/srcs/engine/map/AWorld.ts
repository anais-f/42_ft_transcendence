import { Segment } from '../../math/Segment'
import { Circle } from '../../math/shapes/Circle'
import { Polygon } from '../../math/shapes/Polygon'
import { Vector2 } from '../../math/Vector2'
import { PongMap } from './Map'

export enum WorldShape {
	Rectangle,
}

export abstract class AWorld {
	private shape: WorldShape
	private map: PongMap

	protected constructor(ws: WorldShape, map: PongMap) {
		this.shape = ws
		this.map = map
	}

	public getShape() {
		return this.shape
	}

	public getObjs() {
		return this.map.getObjs()
	}

	public abstract isInside(o: Vector2): boolean
	public abstract isInside(o: Segment): boolean
	public abstract isInside(o: Circle): boolean
	public abstract isInside(o: Polygon): boolean

	public abstract isInside(_o: Vector2 | Segment | Circle | Polygon): boolean
}
