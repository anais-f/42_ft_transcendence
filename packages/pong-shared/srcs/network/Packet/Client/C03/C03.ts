export class C03BallBase {
	constructor(public time: number) {
		this.time = time
	}

	getTime(): number {
		return this.time
	}

	static createC03() {
		return new C03BallBase(Date.now())
	}

	protected fserialize(): ArrayBuffer {
		const buff = new ArrayBuffer(9)
		const view = new DataView(buff)

		view.setFloat64(0, this.time, true)
		view.setUint8(8, 0b101)

		return buff
	}
}
