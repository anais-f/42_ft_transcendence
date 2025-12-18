import { tournaments, usersInTournaments } from '../gameData.js'

export function deleteTournament(tournamentCode: string) {
	const tournament = tournaments.get(tournamentCode)
	if (!tournament) {
		throw new Error('Tournament not found')
	}
	tournament.participants.forEach((userId) => {
		usersInTournaments.delete(userId)
	})
	tournaments.delete(tournamentCode)
}
