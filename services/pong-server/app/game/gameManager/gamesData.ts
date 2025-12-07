import { IGameData } from '../../utils/createGame'

export const games = new Map<
	string,
	{
		p1: undefined | number
		p2: undefined | number
		gameInstance: IGameData | undefined
	}
>()
export const playerToGame = new Map<number, string>()
