import { GameState } from '@ft_transcendence/pong-shared'
import { saveMatchToHistory } from '../../../repositories/matchsRepository.js'
import { games, GameData, playerToGame, busyPlayers } from '../gameData.js'
import { clearGameTimeout } from './startTimeOut.js'

export function leaveGame(code: string) {
	const gameData = games.get(code)
	if (!gameData) {
		return
	}

	clearGameTimeout(code)

	if (gameData.status !== 'ended') {
		gameData.gameInstance?.GE.setState(GameState.Paused)
		forfeit(gameData)
		gameData.status = 'ended'
	}

	if (gameData.p1) {
		playerToGame.delete(gameData.p1.id)
		busyPlayers.delete(gameData.p1.id)
	}

	if (gameData.p2) {
		playerToGame.delete(gameData.p2.id)
		busyPlayers.delete(gameData.p2.id)
	}
	games.delete(code)
}

function forfeit(gameData: GameData) {
	if (!gameData.p2) {
		// open game, nobody joined
		return
	}

	if (!gameData.p1.ws) {
		// p1 left, p2 wins
		gameData.p2.ws?.send(
			JSON.stringify({ type: 'EOG', data: { reason: 'opponent left' } })
		)
		saveMatchToHistory(gameData.p1.id, gameData.p2.id, 0, 1)
	} else {
		// p2 left, p1 wins
		gameData.p1.ws.send(
			JSON.stringify({ type: 'EOG', data: { reason: 'opponent left' } })
		)
		saveMatchToHistory(gameData.p1.id, gameData.p2.id, 1, 0)
	}
}
