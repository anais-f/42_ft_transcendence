import { getDb } from '../database/connection.js'

export function saveMatchToHistory(
	player1Id: number,
	player2Id: number,
	scorePlayer1: number,
	scorePlayer2: number,
	idTournament: number = -1,
	round: number = -1

): number {
	const db = getDb()
	const winnerId = scorePlayer1 > scorePlayer2 ? player1Id : player2Id

	const matchResult = db
		.prepare(
			`
		INSERT INTO match_history (winner_id, id_tournament, round)
		VALUES (?, ?, ?)
	`
		)
		.run(winnerId, idTournament, round)

	const matchId = matchResult.lastInsertRowid as number

	db.prepare(
		`
		INSERT INTO match_player (id_match, player_id, score)
		VALUES (?, ?, ?)
	`
	).run(matchId, player1Id, scorePlayer1)

	db.prepare(
		`
		INSERT INTO match_player (id_match, player_id, score)
		VALUES (?, ?, ?)
	`
	).run(matchId, player2Id, scorePlayer2)

	return matchId
}

export function getMatchHistoryByPlayerId(targetUserId: number)
{
	const db = getDb()
	const matches = db
		.prepare(
			`
		SELECT mh.id_match, mh.winner_id, mh.played_at, mp.player_id, mp.score
		FROM match_history mh
		JOIN match_player mp ON mh.id_match = mp.id_match
		WHERE mp.player_id = ?
		ORDER BY mh.played_at DESC
		LIMIT 20
	`
		)
		.all(targetUserId)
	return matches
}

