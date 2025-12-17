import { saveMatchToHistory } from '../../../repositories/matchsRepository.js'
import { games, playerToGame, busyPlayers } from '../gameData.js'
import { clearGameTimeout } from './startTimeOut.js'
import {
	onTournamentMatchEnd,
	createTournamentMatchResult,
	ITournamentMatchResult
} from '../../tournamentUsecases.js'

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

	saveMatchToHistory(
		gameData.p1.id,
		gameData.p2.id,
		score.p1,
		score.p2,
		gameData.tournamentMatchData?.tournamentId ?? -1,
		gameData.tournamentMatchData?.round ?? -1,
		gameData.tournamentMatchData?.matchNumber ?? -1
	)

	const p1Won = score.p1 > score.p2
	const reason = p1Won ? 'p1 won' : 'p2 won'
	const eogMessage = JSON.stringify({ type: 'EOG', data: { reason } })

	gameData.p1.ws?.send(eogMessage)
	gameData.p2.ws?.send(eogMessage)

	// Store tournament data before cleanup
	const tournamentData: ITournamentMatchResult | null =
		createTournamentMatchResult(
			gameData.tournamentMatchData,
			score.p1 > score.p2 ? gameData.p1.id : gameData.p2.id,
			score.p1,
			score.p2
		)

	playerToGame.delete(gameData.p1.id)
	playerToGame.delete(gameData.p2.id)
	busyPlayers.delete(gameData.p1.id)
	busyPlayers.delete(gameData.p2.id)
	games.delete(code)

	// Call tournament callback after cleanup
	if (tournamentData) {
		onTournamentMatchEnd(tournamentData)
	}
}
