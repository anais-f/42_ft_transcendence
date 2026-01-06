import { saveMatchToHistory } from '../../../../repositories/matchesRepository.js'
import { games, playerToGame, busyPlayers } from '../../gameData.js'
import { clearGameTimeout } from './startTimeOut.js'
import { createTournamentMatchResult } from '../../tournamentManager/tournamentUsecases.js'
import { onTournamentMatchEnd } from '../../tournamentManager/onTournamentMatchEnd.js'
import { initEOG } from '../../../ws/gameUpdate/eogMessage.js'
import { updateGameMetrics } from '../../metricsService.js'

export function endGame(code: string) {
	const gameData = games.get(code)
	if (!gameData || gameData.status === 'ended') {
		return
	}

	clearGameTimeout(code)
	gameData.status = 'ended'

	const score = gameData.gameInstance?.GE.lives
	if (!score || !gameData.p2) {
		return
	}

	saveMatchToHistory(gameData.p1.id, gameData.p2.id, score.p1, score.p2)

	const p1Won = score.p1 > score.p2
	const eogMessage = initEOG(
		p1Won ? gameData.p1.id : gameData.p2.id,
		p1Won ? gameData.p2.id : gameData.p1.id,
		score.p1,
		score.p2,
		'score'
	)

	gameData.p1.ws?.send(eogMessage)
	gameData.p2.ws?.send(eogMessage)
	gameData.p1.ws?.close(1000, 'Game ended')
	gameData.p2.ws?.close(1000, 'Game ended')

	let tournamentData = undefined
	if (gameData.tournamentMatchData) {
		tournamentData = createTournamentMatchResult(
			gameData.tournamentMatchData,
			score.p1 > score.p2 ? gameData.p1.id : gameData.p2.id,
			score.p1,
			score.p2
		)
	}

	playerToGame.delete(gameData.p1.id)
	playerToGame.delete(gameData.p2.id)
	busyPlayers.delete(gameData.p1.id)
	busyPlayers.delete(gameData.p2.id)
	games.delete(code)

	updateGameMetrics()

	if (tournamentData) {
		onTournamentMatchEnd(tournamentData)
	}
}
