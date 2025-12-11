import { saveMatchToHistory } from '../../../repositories/matchsRepository.js'
import { games, GameData, playerToGame } from '../gameData.js'

// todo silent throw ?
export function leaveGame(pID: number) {
	const gameCode = playerToGame.get(pID)
	if (!gameCode) {
		throw new Error('player not in game')
	}

	deleteGame(gameCode)
}

function deleteGame(gameCode: string) {
	const gameData = games.get(gameCode)
	if (!gameData) {
		throw new Error('game not found')
	}

	forfeit(gameData) // set game in DB

	if (gameData.p1) {
		playerToGame.delete(gameData.p1.id)
	}

	if (gameData.p2) {
		playerToGame.delete(gameData.p2.id)
	}
	games.delete(gameCode)
}

function forfeit(gameData: GameData) {
	if (!gameData.p2) {
		// open game nobody join
		return // no op
	}

	if (gameData.status == 'active') {
		// game already started
		if (gameData.p1?.connState) {
			saveMatchToHistory(gameData.p1.id, gameData.p2.id, 1, 0)
		} else {
			saveMatchToHistory(gameData.p1.id, gameData.p2.id, 0, 1)
		}
	} else {
		// waiting
		if (!gameData.p1.connState) {
			saveMatchToHistory(gameData.p1.id, gameData.p2.id, 0, 1)
		} else if (!gameData.p2.connState) {
			saveMatchToHistory(gameData.p1.id, gameData.p2.id, 1, 0)
		}
	}
}
