import { IGameData } from '../createGame.js'
import { Tournament } from '@ft_transcendence/common'

export type GameStatus = 'waiting' | 'active'
export type TPlayerSlot = 'p1' | 'p2'

export interface Iplayer {
	id: number
	connState: boolean
}

export interface GameData {
	p1: Iplayer
	p2: Iplayer | undefined
	gameInstance: IGameData | undefined
	status: GameStatus
	createdAt: number
}

// individial game
export const games = new Map<string, GameData>()
export const playerToGame = new Map<number, string>()

// tournament
// TODO: usersToTournaments
export const tournaments = new Map<string, Tournament>()
export const usersInTournaments = new Set<number>()
