import { FastifyReply, FastifyRequest } from 'fastify'
import { saveMatchShema } from '@ft_transcendence/common'
import { saveMatchToHistory } from '../repositories/matchsRepository.js'

export function saveMatch(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const parse = saveMatchShema.parse(request.body)
	if (!parse) {
		return reply.status(400).send({ error: 'Invalid match data' })
	}
	const { player1Id, player2Id, scorePlayer1, scorePlayer2, idTournament, round } =
		parse
	const matchId = saveMatchToHistory(
		player1Id,
		player2Id,
		scorePlayer1,
		scorePlayer2,
		idTournament,
		round
	)
	return reply.send({ success: true, matchId })
}
