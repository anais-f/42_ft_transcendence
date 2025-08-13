import { Shape } from '../math/shapes/Shape'

export class PhysicsEngine {
	private objs: Shape[] = []

	public constructor() {}

	public addObj(obj: Shape) {
		this.objs.push(obj)
	}

	public playTick() {
		// TODO: implement
	}
}
