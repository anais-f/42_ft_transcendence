import { IGameData } from '../../utils/createGame'

interface Iplayer {
	id: number
	connState: boolean
}
export const games = new Map<
	string,
	{
		p1: Iplayer | undefined
		p2: Iplayer | undefined
		gameInstance: IGameData | undefined
	}
>()
export const playerToGame = new Map<number, string>()
