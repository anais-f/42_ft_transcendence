import { TournamentDTO, CodeParamSchema } from '@ft_transcendence/common'
import createHttpError from 'http-errors'
import { FastifyRequest } from 'fastify'
import { tournaments } from '../gameData.js'

export function getTournament(request: FastifyRequest): TournamentDTO {
	const userId = request.user.user_id
	if (userId === undefined) {
		throw createHttpError.Unauthorized("You're not authenticated")
	}
	const tournamentCode = CodeParamSchema.parse(request.params)
	const tournament = tournaments.get(tournamentCode.code)
	if (!tournament) {
		throw createHttpError.NotFound('Unknown tournament')
	}
	if (!tournament.participants.includes(userId)) {
		throw createHttpError.Forbidden(
			"You're not a participant of this tournament"
		)
	}
	return tournament
}
