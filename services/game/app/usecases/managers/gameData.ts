import { IGameData } from '../createGame.js'
import { Tournament } from '@ft_transcendence/common'

export type GameStatus = 'waiting' | 'active' | 'ended'
export type TPlayerSlot = 'p1' | 'p2'

import WebSocket from 'ws'

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
}

// individial game
export const games = new Map<string, GameData>()
export const playerToGame = new Map<number, string>()
export const busyPlayers = new Set<number>()

// tournament
export const tournaments = new Map<string, Tournament>()
export const usersInTournaments = new Set<number>()
