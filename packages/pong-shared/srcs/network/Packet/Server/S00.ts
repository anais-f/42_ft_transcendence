export interface IS00PongBase {
	time: number
	getTime(): number
	serialize(): ArrayBuffer
}
