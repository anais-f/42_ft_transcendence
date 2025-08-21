import { PongObject } from '../objects/PongObject'

export class PongMap {
	private objs: PongObject[] = []
	public constructor() {}

	public addObj(obj: PongObject) {
		this.objs.push(obj)
	}

	public getObjs(): PongObject[] {
		return this.objs
	}
}
