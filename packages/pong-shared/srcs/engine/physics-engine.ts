import { WorldRect } from './map/worldType/WorldRect'
import { PongObject } from './objects/PongObject'
import { AWorld } from './map/AWorld'

export class PhysicsEngine {
	private objs: PongObject[] = []
	private world: AWorld

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
