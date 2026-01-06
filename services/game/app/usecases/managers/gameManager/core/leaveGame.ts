import { GameState } from '@ft_transcendence/pong-shared'
import { saveMatchToHistory } from '../../../../repositories/matchesRepository.js'
import { games, GameData, playerToGame, busyPlayers } from '../../gameData.js'
import { clearGameTimeout } from './startTimeOut.js'
import { createTournamentMatchResult } from '../../tournamentManager/tournamentUsecases.js'
import { ITournamentMatchResult } from '../../gameData.js'
import { onTournamentMatchEnd } from '../../tournamentManager/onTournamentMatchEnd.js'
import { initEOG } from '../../../ws/gameUpdate/eogMessage.js'
import { updateGameMetrics } from '../../metricsService.js'

export function leaveGame(code: string) {
	const gameData = games.get(code)
	if (!gameData) {
		return
	}

	clearGameTimeout(code)

	let tournamentCpy: ITournamentMatchResult | null = null

	if (gameData.status !== 'ended') {
		gameData.gameInstance?.GE.setState(GameState.Paused)
		tournamentCpy = forfeit(gameData)
		gameData.status = 'ended'
	}

	if (gameData.p1) {
		playerToGame.delete(gameData.p1.id)
		busyPlayers.delete(gameData.p1.id)
		gameData.p1.ws?.close(1001, 'Game abandoned')
	}

	if (gameData.p2) {
		playerToGame.delete(gameData.p2.id)
		busyPlayers.delete(gameData.p2.id)
		gameData.p2.ws?.close(1001, 'Game abandoned')
	}
	games.delete(code)

	updateGameMetrics()

	// Call tournament callback after cleanup
	if (tournamentCpy) {
		onTournamentMatchEnd(tournamentCpy)
	}
}

function forfeit(gameData: GameData): ITournamentMatchResult | null {
	if (!gameData.p2) {
		// open game, nobody joined
		return null
	}

	let winnerId: number
	let scorePlayer1: number
	let scorePlayer2: number

	if (!gameData.p1.ws) {
		// p1 left, p2 wins
		winnerId = gameData.p2.id
		scorePlayer1 = 0
		scorePlayer2 = 1
		const eogMessage = initEOG(
			gameData.p2.id,
			gameData.p1.id,
			scorePlayer1,
			scorePlayer2,
			'forfeit'
		)
		gameData.p2.ws?.send(eogMessage)
	} else {
		// p2 left, p1 wins
		winnerId = gameData.p1.id
		scorePlayer1 = 1
		scorePlayer2 = 0
		const eogMessage = initEOG(
			gameData.p1.id,
			gameData.p2.id,
			scorePlayer1,
			scorePlayer2,
			'forfeit'
		)
		gameData.p1.ws.send(eogMessage)
	}

	saveMatchToHistory(gameData.p1.id, gameData.p2.id, scorePlayer1, scorePlayer2)

	if (gameData.tournamentMatchData) {
		return createTournamentMatchResult(
			gameData.tournamentMatchData,
			winnerId,
			scorePlayer1,
			scorePlayer2
		)
	}

	return null
}
