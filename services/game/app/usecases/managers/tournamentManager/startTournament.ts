import { Tournament } from '@ft_transcendence/common'
import { requestGame } from '../gameManager/requestGame.js'
import { createTournamentTree } from './createTournamentTree.js'
import { updateGameMetrics } from '../metricsService.js'

export function startTournament(code: string, tournament: Tournament) {
	tournament.status = 'ongoing'
	createTournamentTree(tournament)
	// Only start the first round (highest round number)
	startFirstRound(code, tournament)

	updateGameMetrics()
}

function startFirstRound(code: string, tournament: Tournament) {
	const roundMatches = tournament.matchs.filter(
		(match) => match.round === Math.log2(tournament.maxParticipants)
	)
	roundMatches.forEach((match) => {
		if (match.player1Id === undefined || match.player2Id === undefined) {
			console.error('Invalid match data for next round:', match)
			return
		}
		match.status = 'ongoing'
		requestGame(match.player1Id, match.player2Id, {
			tournamentCode: code,
			round: match.round,
			matchNumber: match.matchNumber
		})
	})
}
