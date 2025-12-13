import WebSocket from 'ws'
import { createWsError } from '@ft_transcendence/common'
import { WsTokenPayload } from '@ft_transcendence/security'
import {
	TPlayerSlot,
	GameData,
	games,
	playerToGame,
	Iplayer
} from '../managers/gameData.js'
import { startCountdown } from './startCountdown.js'

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
	gameData[playerSlot].ws = socket

	socket.send(JSON.stringify({ type: 'slot', data: { slot: playerSlot } }))

	const opponent: TPlayerSlot = playerSlot == 'p1' ? 'p2' : 'p1'
	const opponentData = gameData[opponent]

	if (opponentData) {
		notifyOpponent(opponentData, user, socket)
	}

	if (gameData.p1.ws && gameData.p2?.ws) {
		startCountdown(gameData, gameCode)
	}

	console.log(
		`[+] ${user.login}(${user.user_id}) join game: ${gameCode} as ${playerSlot}`
	)

	return { user, gameCode, playerSlot, gameData }
}

function notifyOpponent(
	opponentData: Iplayer,
	user: WsTokenPayload,
	socket: WebSocket
) {
	opponentData?.ws?.send(
		JSON.stringify({ type: 'opponent', data: { id: user.user_id } })
	)

	if (opponentData) {
		socket.send(
			JSON.stringify({ type: 'opponent', data: { id: opponentData.id } })
		)
	}
}
