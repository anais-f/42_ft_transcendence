import { FastifyReply, FastifyRequest } from 'fastify'
import { saveMatchShema } from '@ft_transcendence/common'
import { saveMatchToHistory } from '../repositories/matchsRepository.js'
import { onTournamentMatchEnd, getTournamentCodeById } from './tournamentUsecases.js'
import createHttpError from 'http-errors'

export function saveMatch(request: FastifyRequest, reply: FastifyReply) {
	const parse = saveMatchShema.parse(request.body)
	if (!parse) {
		throw createHttpError.BadRequest()
	}
	const {
		player1Id,
		player2Id,
		scorePlayer1,
		scorePlayer2,
		idTournament,
		round,
		matchNumber
	} = parse
	const matchId = saveMatchToHistory(
		player1Id,
		player2Id,
		scorePlayer1,
		scorePlayer2,
		idTournament,
		round
	)
	if (idTournament !== undefined && idTournament !== -1 && round !== undefined && round !== -1 && matchNumber !== undefined) {
		const winnerId = scorePlayer1 > scorePlayer2 ? player1Id : player2Id
		const tournamentCode = getTournamentCodeById(idTournament)
		
		if (tournamentCode) {
			onTournamentMatchEnd(
				tournamentCode,
				round,
				matchNumber,
				winnerId,
				scorePlayer1,
				scorePlayer2
			)
		}
	}
	
	return reply.send({ success: true, matchId })
}
