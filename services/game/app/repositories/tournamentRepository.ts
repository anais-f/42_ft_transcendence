import { getDb } from '../database/connection.js'

export function getTournamentById(tournamentId: number) {
	const db = getDb()
	const tournament = db
		.prepare(
			`
		SELECT mh.id_tournament, mh.round, mh.played_at
		FROM match_history mh
		WHERE mh.id_tournament = ?
		LIMIT 1
	`
		)
		.get(tournamentId)
	console.log('Fetched tournament:', tournament)
	return tournament
}
