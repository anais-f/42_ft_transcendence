import { PongObject } from './objects/PongObject.js'

export class PhysicsEngine {
	private objs: PongObject[] = []

	public constructor() {
	}

	public addObj(obj: PongObject) {
		this.objs.push(obj)
	}

	public playTick() {
		// TODO: implement
	}
}
