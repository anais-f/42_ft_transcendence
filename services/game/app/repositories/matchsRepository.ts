import { getDb } from '../database/connection.js'
import type { MatchHistoryItemDTO } from '@ft_transcendence/common'

export function getNextTournamentId(): number {
	const db = getDb()
	const result = db
		.prepare('SELECT MAX(id_tournament) as max_id FROM match_history')
		.get() as { max_id: number | null }

	// If no tournaments exist yet, start at 1, otherwise increment the max
	return result.max_id !== null && result.max_id >= 0 ? result.max_id + 1 : 1
}

export function saveMatchToHistory(
	player1Id: number,
	player2Id: number,
	scorePlayer1: number,
	scorePlayer2: number,
	tournamentId: number = -1,
	round: number = -1,
	matchNumber: number = -1
): number {
	console.log(
		`[${player1Id}]: ${scorePlayer1} | [${player2Id}]: ${scorePlayer2}`
	)
	const db = getDb()
	const winnerId = scorePlayer1 > scorePlayer2 ? player1Id : player2Id

	const matchResult = db
		.prepare(
			`
		INSERT INTO match_history (winner_id, id_tournament, round, match_number)
		VALUES (?, ?, ?, ?)
	`
		)
		.run(winnerId, tournamentId, round, matchNumber)

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

export function getMatchHistoryByPlayerId(
	targetUserId: number
): MatchHistoryItemDTO[] {
	const db = getDb()
	const matches = db
		.prepare(
			`
		SELECT 
			mh.id_match,
			mh.winner_id,
			mh.played_at,
			mh.id_tournament,
			mh.round,
			mh.match_number,
			mp1.player_id as player1_id,
			mp1.score as player1_score,
			mp2.player_id as player2_id,
			mp2.score as player2_score
		FROM match_history mh
		JOIN match_player mp1 ON mh.id_match = mp1.id_match
		JOIN match_player mp2 ON mh.id_match = mp2.id_match
		WHERE (mp1.player_id = ? OR mp2.player_id = ?)
		  AND mp1.player_id < mp2.player_id
		ORDER BY mh.played_at DESC
		LIMIT 20
	`
		)
		.all(targetUserId, targetUserId) as MatchHistoryItemDTO[]
	return matches
}
