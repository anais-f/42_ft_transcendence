export interface ILives {
	p1: number
	p2: number
}

export function createScore(maxPoint: number): ILives {
	return { p1: maxPoint, p2: maxPoint }
}
