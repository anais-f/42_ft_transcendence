import { FastifyReply, FastifyRequest } from 'fastify'
import { IdParamSchema } from '@ft_transcendence/common'
import { getDb } from '../database/connection.js'

export function getMatchHistoryController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const userId = request.user.user_id
	if (userId === undefined) {
		return reply.status(401).send({ error: 'Unauthorized' })
	}
	const matchId = IdParamSchema.parse(request.params).id
	const db = getDb()
	const match = db
		.prepare(
			`
		SELECT mh.id_match, mh.winner_id, mh.played_at, mp.player_id, mp.score
		FROM match_history mh
		JOIN match_player mp ON mh.id_match = mp.id_match
		WHERE mh.id_match = ? AND (mp.player_id = ? OR mh.winner_id = ?)
	`
		)
		.all(matchId, userId, userId)
	if (match.length === 0) {
		return reply.status(404).send({ error: 'Match not found or access denied' })
	}
	return reply.send({ success: true, match })
}

export function getUserMatchHistoryController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const userId = request.user.user_id
	if (userId === undefined) {
		return reply.status(401).send({ error: 'Unauthorized' })
	}
	const targetUserId = IdParamSchema.parse(request.params).id
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
	return reply.send({ success: true, matches })
}
