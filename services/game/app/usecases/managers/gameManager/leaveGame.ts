import { saveMatchToHistory } from '../../../repositories/matchsRepository.js'
import { games, GameData, playerToGame } from '../gameData.js'

export function leaveGame(code: string) {
	const gameData = games.get(code)
	if (!gameData) {
		return
	}

	forfeit(gameData) // set game in DB

	if (gameData.p1) {
		playerToGame.delete(gameData.p1.id)
	}

	if (gameData.p2) {
		playerToGame.delete(gameData.p2.id)
	}
	games.delete(code)
}

function forfeit(gameData: GameData) {
	if (!gameData.p2) {
		// open game nobody join
		return // no op
	}

	if (gameData.status == 'active') {
		// game already started
		if (gameData.p1?.ws) {
			saveMatchToHistory(gameData.p1.id, gameData.p2.id, 1, 0)
		} else {
			saveMatchToHistory(gameData.p1.id, gameData.p2.id, 0, 1)
		}
	} else {
		// waiting
		if (!gameData.p1.ws) {
			saveMatchToHistory(gameData.p1.id, gameData.p2.id, 0, 1)
		} else if (!gameData.p2.ws) {
			saveMatchToHistory(gameData.p1.id, gameData.p2.id, 1, 0)
		}
	}
}
