import { games, playerToGame } from '../gameData.js'
import { startTimeOut } from './startTimeOut.js'

export function joinGame(gameCode: string, pID: number) {
	const gameData = games.get(gameCode)
	if (!gameData) {
		throw new Error('unknown game code')
	}

	if (gameData.p1.id === pID) {
		if (gameData.p1.connState) {
			throw new Error('player is already in a game')
		}
		return
	}

	if (gameData.p2?.id === pID) {
		if (gameData.p2.connState) {
			throw new Error('player is already in a game')
		}
		return
	}

	if (!gameData.p2) {
		gameData.p2 = { id: pID, connState: false }
		playerToGame.set(pID, gameCode)
		startTimeOut(gameCode, 50000)
		return
	}

	throw new Error('player not allowed in this game')
}
