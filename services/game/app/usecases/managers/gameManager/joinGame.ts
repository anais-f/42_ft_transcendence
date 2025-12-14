import { games, playerToGame, busyPlayers } from '../gameData.js'
import { startTimeOut } from './startTimeOut.js'

export function joinGame(gameCode: string, pID: number) {
	const gameData = games.get(gameCode)
	if (!gameData) {
		throw new Error('unknown game code')
	}

	if (busyPlayers.has(pID)) {
		throw new Error('player is already in a game')
	}

	if (gameData.p1.id === pID || gameData.p2?.id === pID) {
		busyPlayers.add(pID)
		return
	}

	if (playerToGame.has(pID)) {
		throw new Error('player is already in a game')
	}

	if (!gameData.p2) {
		gameData.p2 = { id: pID, ws: null }
		playerToGame.set(pID, gameCode)
		busyPlayers.add(pID)
		try {
			startTimeOut(gameCode, 20000)
		} catch (_) {
			// This can happen with normal use
		}
		return
	}

	throw new Error('player not allowed in this game')
}
