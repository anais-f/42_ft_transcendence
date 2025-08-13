import { Shape } from '../../math/shapes/Shape'

export class PongMap {
	private objs: Shape[] = []
	public constructor() {}

	public addObj(obj: Shape) {
		this.objs.push(obj)
	}

	public getObjs(): Shape[] {
		return this.objs
	}
}
