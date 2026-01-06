import { ITournamentMatchResult } from '../gameData.js'
import createHttpError from 'http-errors'
import { tournaments, usersToTournament } from '../gameData.js'
import * as GameManager from '../gameManager/index.js'
import { updateGameMetrics } from '../metricsService.js'

export function onTournamentMatchEnd(
	tournamentData: ITournamentMatchResult
): void {
	const tournamentMatchData = tournamentData.tournamentMatchData
	const tournamentCode = tournamentMatchData.tournamentCode
	const tournament = tournaments.get(tournamentCode)
	if (!tournament) {
		throw createHttpError.NotFound('Tournament not found')
	}

	// Find the match that just ended
	const currentMatch = tournament.matches.find(
		(m) =>
			m.round === tournamentMatchData.round &&
			m.matchNumber === tournamentMatchData.matchNumber
	)
	if (!currentMatch) {
		throw createHttpError.NotFound('Match not found')
	}

	// Update match status, scores, and winner
	currentMatch.status = 'completed'
	currentMatch.scorePlayer1 = tournamentData.scorePlayer1
	currentMatch.scorePlayer2 = tournamentData.scorePlayer2
	currentMatch.winnerId = tournamentData.winnerId

	// If this was the final (round 1), tournament is over
	if (tournamentMatchData.round === 1) {
		tournament.status = 'completed'

		// Clean up participants from tracking
		tournament.participants.forEach((userId) => {
			usersToTournament.delete(userId)
		})

		updateGameMetrics()
		setTimeout(() => tournaments.delete(tournamentCode), 1 * 60 * 1000	)
		return
	}

	// Find the next round match that this winner should advance to
	const nextRoundMatch = tournament.matches.find(
		(m) =>
			m.round === tournamentMatchData.round - 1 &&
			(m.previousMatchId1 === tournamentMatchData.matchNumber ||
				m.previousMatchId2 === tournamentMatchData.matchNumber)
	)

	if (!nextRoundMatch) {
		return
	}

	// Place winner in the appropriate slot of next match
	if (nextRoundMatch.previousMatchId1 === tournamentMatchData.matchNumber) {
		nextRoundMatch.player1Id = tournamentData.winnerId
	} else if (
		nextRoundMatch.previousMatchId2 === tournamentMatchData.matchNumber
	) {
		nextRoundMatch.player2Id = tournamentData.winnerId
	}

	if (
		nextRoundMatch.player1Id !== undefined &&
		nextRoundMatch.player2Id !== undefined &&
		nextRoundMatch.status === 'waiting_for_players'
	) {
		const gameCode = GameManager.requestGame(
			nextRoundMatch.player1Id,
			nextRoundMatch.player2Id,
			{
				tournamentCode: tournamentCode,
				round: nextRoundMatch.round,
				matchNumber: nextRoundMatch.matchNumber
			}
		)
		nextRoundMatch.gameCode = gameCode
	}
}
