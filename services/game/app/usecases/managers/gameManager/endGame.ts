import { saveMatchToHistory } from '../../../repositories/matchsRepository.js'
import { games, playerToGame } from '../gameData.js'
import { clearGameTimeout } from './startTimeOut.js'

export function endGame(code: string) {
	const gameData = games.get(code)
	if (!gameData || gameData.status === 'ended') {
		return
	}

	clearGameTimeout(code)
	gameData.status = 'ended'

	const score = gameData.gameInstance?.GE.score
	if (!score || !gameData.p2) {
		return
	}

	saveMatchToHistory(gameData.p1.id, gameData.p2.id, score.p1, score.p2)

	const p1Won = score.p1 > score.p2
	const reason = p1Won ? 'p1 won' : 'p2 won'
	const eogMessage = JSON.stringify({ type: 'EOG', data: { reason } })

	gameData.p1.ws?.send(eogMessage)
	gameData.p2.ws?.send(eogMessage)

	playerToGame.delete(gameData.p1.id)
	playerToGame.delete(gameData.p2.id)
	games.delete(code)
}
