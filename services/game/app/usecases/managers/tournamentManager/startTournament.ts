import { Tournament } from '@ft_transcendence/common'
import * as GameManager from '../../managers/gameManager/index.js'
import { createTournamentTree } from './createTournamentTree.js'
import { updateGameMetrics } from '../metricsService.js'

export function startTournament(code: string, tournament: Tournament) {
	tournament.status = 'ongoing'
	createTournamentTree(tournament)

	setTimeout(() => {
		startFirstRound(code, tournament)
	}, 5000)

	updateGameMetrics()
}

function startFirstRound(code: string, tournament: Tournament) {
	const roundMatches = tournament.matches.filter(
		(match) => match.round === Math.log2(tournament.maxParticipants)
	)
	roundMatches.forEach((match) => {
		if (match.player1Id === undefined || match.player2Id === undefined) {
			console.error('Invalid match data for next round:', match)
			return
		}
		match.status = 'ongoing'
		const gameCode = GameManager.requestGame(match.player1Id, match.player2Id, {
			tournamentCode: code,
			round: match.round,
			matchNumber: match.matchNumber
		})
		match.gameCode = gameCode
	})
}
