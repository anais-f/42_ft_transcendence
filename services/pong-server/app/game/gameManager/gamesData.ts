import { IGameData } from '../../utils/createGame'

export type GameStatus = 'waiting' | 'active'

export interface Iplayer {
	id: number
	connState: boolean
}

export interface GameData {
	p1: Iplayer | undefined
	p2: Iplayer | undefined
	gameInstance: IGameData | undefined
	status: GameStatus
	createdAt: number
}

export const games = new Map<string, GameData>()
export const playerToGame = new Map<number, string>()
