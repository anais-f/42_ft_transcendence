import { GameState } from '@ft_transcendence/pong-shared'
import { saveMatchToHistory } from '../../../repositories/matchsRepository.js'
import { games, GameData, playerToGame, busyPlayers } from '../gameData.js'
import { clearGameTimeout } from './startTimeOut.js'
import { createTournamentMatchResult } from '../tournamentManager/tournamentUsecases.js'
import { ITournamentMatchResult } from '../gameData.js'
import { onTournamentMatchEnd } from '../tournamentManager/onTournamentMatchEnd.js'

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
	}

	if (gameData.p2) {
		playerToGame.delete(gameData.p2.id)
		busyPlayers.delete(gameData.p2.id)
	}
	games.delete(code)

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
		gameData.p2.ws?.send(
			JSON.stringify({ type: 'EOG', data: { reason: 'opponent left' } })
		)
		winnerId = gameData.p2.id
		scorePlayer1 = 0
		scorePlayer2 = 1
		saveMatchToHistory(
			gameData.p1.id,
			gameData.p2.id,
			scorePlayer1,
			scorePlayer2,
			gameData.tournamentMatchData
		)
	} else {
		// p2 left, p1 wins
		gameData.p1.ws.send(
			JSON.stringify({ type: 'EOG', data: { reason: 'opponent left' } })
		)
		winnerId = gameData.p1.id
		scorePlayer1 = 1
		scorePlayer2 = 0
		saveMatchToHistory(
			gameData.p1.id,
			gameData.p2.id,
			scorePlayer1,
			scorePlayer2,
			gameData.tournamentMatchData
		)
	}

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
