export interface IScore {
	p1: number
	p2: number
	max: number
}

export function createScore(maxPoint: number): IScore {
	return { p1: 0, p2: 0, max: maxPoint }
}
