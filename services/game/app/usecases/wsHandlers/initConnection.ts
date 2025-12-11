import WebSocket from 'ws'
import { createWsError } from '@ft_transcendence/common'
import { WsTokenPayload } from '@ft_transcendence/security'
import {
	TPlayerSlot,
	GameData,
	games,
	playerToGame
} from '../managers/gameData.js'

export interface ConnectionContext {
	user: WsTokenPayload
	gameCode: string
	playerSlot: TPlayerSlot
	gameData: GameData
}

export function initGameWsConnection(
	socket: WebSocket,
	payload: WsTokenPayload
): ConnectionContext {
	const user = payload

	const gameCode = playerToGame.get(user.user_id)
	if (!gameCode) throw createWsError(socket, 4000, 'player have no active game')

	const gameData = games.get(gameCode)
	if (!gameData) throw createWsError(socket, 4001, 'game not found')

	const playerSlot: TPlayerSlot = gameData.p1.id === user.user_id ? 'p1' : 'p2'

	// @ts-ignore - gameData.p2 can't be null (if playerSlot == p2)
	gameData[playerSlot].connState = true

	console.log(`[+] ${user.login} join game: ${gameCode} as ${playerSlot}`)

	return { user, gameCode, playerSlot, gameData }
}
