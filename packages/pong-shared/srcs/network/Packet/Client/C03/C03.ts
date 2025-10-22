
export class C03BallBase {
	time: number

	constructor(time: number) {
		this.time = time
	}

	getTime(): number {
		return this.time
	}

	static createC03() {
		return new C03BallBase(Date.now())
	}
}
