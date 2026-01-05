import { tournaments, usersToTournament } from '../gameData.js'
import { updateGameMetrics } from '../metricsService.js'

export function deleteTournament(tournamentCode: string) {
	const tournament = tournaments.get(tournamentCode)
	if (!tournament) {
		throw new Error('Tournament not found')
	}
	tournament.participants.forEach((userId) => {
		usersToTournament.delete(userId)
	})
	tournaments.delete(tournamentCode)

	updateGameMetrics()
}
