import { Shape } from "../math/shapes/Shape"

export class GameEngine {
	private objs: Shape[] = []
	public constructor() {
	}

	public addObj(obj: Shape) {
		this.objs.push(obj)
	}
}
