import { WorldRect } from './map/worldType/WorldRect'
import { PongObject } from './objects/PongObject'
import { World } from './map/World'

export class PhysicsEngine {
	private objs: PongObject[] = []
	private world: World

	public constructor() {
		this.world = new WorldRect()
	}

	public addObj(obj: PongObject) {
		this.objs.push(obj)
	}

	public playTick() {
		// TODO: implement
	}
}
