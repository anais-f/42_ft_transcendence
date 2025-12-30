import { IGameData } from '../createGame.js'
import { Tournament } from '@ft_transcendence/common'
import { MapOptions } from '@ft_transcendence/pong-shared'
import WebSocket from 'ws'

export type GameStatus = 'waiting' | 'active' | 'ended'
export type TPlayerSlot = 'p1' | 'p2'

export interface ITournamentMatchData {
	tournamentCode: string
	round: number
	matchNumber: number
}

export interface ITournamentMatchResult {
	tournamentMatchData: ITournamentMatchData
	winnerId: number
	scorePlayer1: number
	scorePlayer2: number
}

export interface Iplayer {
	id: number
	ws: WebSocket | null
}

export interface GameData {
	p1: Iplayer
	p2: Iplayer | undefined
	gameInstance: IGameData | undefined
	status: GameStatus
	createdAt: number
	timeoutId: ReturnType<typeof setTimeout> | null
	tournamentMatchData?: ITournamentMatchData
	mapOptions: MapOptions
}

// individial game
export const games = new Map<string, GameData>()
export const playerToGame = new Map<number, string>()
export const busyPlayers = new Set<number>()

// tournament
export const tournaments = new Map<string, Tournament>()
export const usersInTournaments = new Set<number>()
