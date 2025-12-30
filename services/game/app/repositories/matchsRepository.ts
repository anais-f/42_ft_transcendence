import { getDb } from '../database/connection.js'
import type {
	MatchHistoryItemDTO,
	PlayerStatsDTO
} from '@ft_transcendence/common'
import { ITournamentMatchData } from '../usecases/managers/gameData.js'

export function saveMatchToHistory(
	player1Id: number,
	player2Id: number,
	scorePlayer1: number,
	scorePlayer2: number,
	tournamentMatchData: ITournamentMatchData | undefined
): number {
	console.log(
		`[${player1Id}]: ${scorePlayer1} | [${player2Id}]: ${scorePlayer2}`
	)
	const db = getDb()
	const winnerId = scorePlayer1 > scorePlayer2 ? player1Id : player2Id

	const matchResult = db
		.prepare(
			`
		INSERT INTO match_history (winner_id, tournament_code)
		VALUES (?, ?)
	`
		)
		.run(winnerId, tournamentMatchData?.tournamentCode ?? null)

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
			mh.tournament_code,
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

export function getStatsByPlayerId(targetUserId: number): PlayerStatsDTO {
	const db = getDb()

	const totalGamesRow = db
		.prepare(
			`
		SELECT COUNT(*) as totalGames
		FROM match_player
		WHERE player_id = ?
	`
		)
		.get(targetUserId) as { totalGames: number }

	const winsRow = db
		.prepare(
			`
		SELECT COUNT(*) as wins
		FROM match_history mh
		JOIN match_player mp ON mh.id_match = mp.id_match
		WHERE mp.player_id = ? AND mh.winner_id = ?
	`
		)
		.get(targetUserId, targetUserId) as { wins: number }
	const avgForRow = db
		.prepare(
			`
		SELECT AVG(score) as avgFor
		FROM match_player
		WHERE player_id = ?
	`
		)
		.get(targetUserId) as { avgFor: number | null }

	const avgAgainstRow = db
		.prepare(
			`
		SELECT AVG(mp.score) as avgAgainst
		FROM match_player mp
		JOIN match_player mp2 ON mp.id_match = mp2.id_match
		WHERE mp2.player_id = ? AND mp.player_id != mp2.player_id
	`
		)
		.get(targetUserId) as { avgAgainst: number | null }

	return {
		totalGames: totalGamesRow.totalGames,
		totalWins: winsRow.wins,
		totalLosses: totalGamesRow.totalGames - winsRow.wins,
		winRate:
			totalGamesRow.totalGames > 0
				? (winsRow.wins / totalGamesRow.totalGames) * 100
				: 0,
		averageScoreFor: avgForRow.avgFor ?? 0,
		averageScoreAgainst: avgAgainstRow.avgAgainst ?? 0
	}
}
