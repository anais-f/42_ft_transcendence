import { saveMatchToHistory } from '../repositories/matchsRepository.js'
import { onTournamentMatchEnd, getTournamentCodeById } from './tournamentUsecases.js'

export function saveMatch(
	player1Id: number,
	player2Id: number,
	scorePlayer1: number,
	scorePlayer2: number,
	tournamentId: number = -1,
	round: number = -1,
	matchNumber: number = -1
): number {
	const matchId = saveMatchToHistory(
		player1Id,
		player2Id,
		scorePlayer1,
		scorePlayer2,
		tournamentId,
		matchNumber,
		round
	)
	if (tournamentId !== -1 && round !== -1 && matchNumber !== -1) {
		const winnerId = scorePlayer1 > scorePlayer2 ? player1Id : player2Id
		const tournamentCode = getTournamentCodeById(tournamentId)

		if (tournamentCode) {
			onTournamentMatchEnd(
				tournamentCode,
				round,
				matchNumber,
				winnerId,
				scorePlayer1,
				scorePlayer2
			)
		}
	}

	return matchId
}
