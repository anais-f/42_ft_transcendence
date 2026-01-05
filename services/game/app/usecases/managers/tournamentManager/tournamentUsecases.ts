import { tournaments } from '../gameData.js'
import { ITournamentMatchResult, ITournamentMatchData } from '../gameData.js'

export function createTournamentMatchResult(
	tournamentData: ITournamentMatchData,
	winnerId: number,
	scoreP1: number,
	scoreP2: number
): ITournamentMatchResult {
	return {
		tournamentMatchData: tournamentData,
		winnerId: winnerId,
		scorePlayer1: scoreP1,
		scorePlayer2: scoreP2
	}
}

/**
 * Helper to get tournament code from a user or game
 */
export function getTournamentByUser(userId: number): string | undefined {
	for (const [code, tournament] of tournaments.entries()) {
		if (tournament.participants.includes(userId)) {
			return code
		}
	}
	return undefined
}
