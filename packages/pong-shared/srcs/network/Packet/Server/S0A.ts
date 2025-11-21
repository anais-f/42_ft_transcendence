import { IS00PongBase } from './S00.js'

export enum ShapeType {
	Circle = 1,
	Polygon = 2
}

export class S0ASync implements IS00PongBase {
	constructor() {}
	time: number = 0
	getTime(): number {
		return this.time
	}
	serialize(): ArrayBuffer {
		return new ArrayBuffer(0)
	}
	// TODO: fix it
	/*
	constructor(
		private border: Segment[],
		private pads: PongPad[],
		private ball: PongBall,
		public time: number = Date.now()
	) {
		if (this.pads.length != 2) {
			throw Error('invalid game')
		}
	}

	getTime(): number {
		return this.time
	}

	getBorders(): Segment[] {
		return this.border
	}

	getPads(): PongPad[] {
		return this.pads
	}

	getBall(): PongBall {
		return this.ball
	}

	serialize(): ArrayBuffer {
		// -----------------------| -- |
		// time 8o                |    |
		// type 1o                | 10o|
		// nb seg 1o [0-255]      |    |
		// -----------------------| -- |
		// each seg 32o
		// -----------------------
		// PongPad =            --|
		// 		PongObject      --|
		// 		1oplayer  	    --|
		// theire is 2 PongPad  --|
		// ---
		// ball
		// PongObject
		// velo
		const borderBytes = 10 + this.border.length * 32

		const pad1Obj = this.pads[0]
		const pad2Obj = this.pads[1]
		const pad1Player = pad1Obj.getPlayer()
		const pad2Player = pad2Obj.getPlayer()
		const pad1Buff = pad1Obj.getObjs().serialize()
		const pad2Buff = pad2Obj.getObjs().serialize()
		const pad1Len = pad1Buff.byteLength
		const pad2Len = pad2Buff.byteLength

		const ballObj = this.ball.getObj()
		const ballBuff = ballObj.serialize()
		const ballLen = ballBuff.byteLength

		const finalLen = borderBytes + 1 + pad1Len + 1 + pad2Len + ballLen + 16
		const buff = new ArrayBuffer(finalLen)
		const view = new DataView(buff)
		let offset = 0

		// HEADER
		view.setFloat64(offset, this.time, true)
		offset += 8
		view.setUint8(offset, SPacketsType.S0A) // type
		++offset
		view.setUint8(offset, this.border.length) // nb segments
		++offset

		// SEGMENTS
		for (const seg of this.border) {
			const segBuf = seg.serialize()
			const segBytes = new Uint8Array(segBuf)
			new Uint8Array(buff, offset, 32).set(segBytes)
			offset += 32
		}

		// PAD 1
		view.setUint8(offset, pad1Player)
		++offset
		new Uint8Array(buff, offset, pad1Len).set(new Uint8Array(pad1Buff))
		offset += pad1Len

		// PAD 2
		view.setUint8(offset, pad2Player)
		++offset
		new Uint8Array(buff, offset, pad2Len).set(new Uint8Array(pad2Buff))
		offset += pad2Len

		// BALL
		new Uint8Array(buff, offset, ballLen).set(new Uint8Array(ballBuff))
		offset += ballLen

		view.setFloat64(offset, this.ball.velo.getX(), true)
		offset += 8
		view.setFloat64(offset, this.ball.velo.getY(), true)
		offset += 8
		return buff
	}
   */
}
