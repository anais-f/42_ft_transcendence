import { games } from '../gameData.js'
import { startTimeOut } from './startTimeOut.js'

export function joinGame(gameCode: string, pID: number) {
	const gameData = games.get(gameCode)
	if (undefined == gameData) {
		throw new Error('unknow game code')
	}

	// TODO: test connstate instead of playerToGame
	//	if (playerToGame.has(pID)) {
	//		throw new Error('player is already in a game')
	//	}

	if (gameData.p1 && gameData.p1.id == pID) {
		return
	}

	if (gameData.p2 && gameData.p2.id == pID) {
		return
	}

	if (undefined == gameData.p2) {
		// open game
		gameData.p2 = { id: pID, connState: false }
		startTimeOut(pID, 5000)
		return
	}

	throw new Error('player not allowed in this game')
}
