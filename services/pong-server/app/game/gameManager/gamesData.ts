import { IGameData } from '../../utils/createGame'

export type GameStatus = 'pending' | 'active' | 'finished'

export interface Iplayer {
	id: number
	connState: boolean
}

export interface GameData {
	p1: Iplayer | undefined
	p2: Iplayer | undefined
	gameInstance: IGameData | undefined
	status: GameStatus
}

export const games = new Map<string, GameData>()
export const playerToActiveGame = new Map<number, string>()
export const playerToPendingGame = new Map<number, string>()
