import { PongObject } from './objects/PongObject.js'

export class PhysicsEngine {
	public tickCount = 0
	private objs: PongObject[] = []

	public constructor() {}

	public addObj(obj: PongObject) {
		this.objs.push(obj)
	}

	public playTick() {
		++this.tickCount
	}
}
