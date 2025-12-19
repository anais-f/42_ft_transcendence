import { TournamentDTO, CodeParamSchema } from '@ft_transcendence/common'
import createHttpError from 'http-errors'
import { FastifyRequest } from 'fastify'
import { tournaments } from '../gameData.js'

export function getTournament(request: FastifyRequest): TournamentDTO {
	const userId = request.user.user_id
	if (userId === undefined) {
		throw createHttpError.Unauthorized()
	}
	const tournamentCode = CodeParamSchema.parse(request.params)
	const tournament = tournaments.get(tournamentCode.code)
	if (!tournament) {
		throw createHttpError.NotFound()
	}
	if (!tournament.participants.includes(userId)) {
		throw createHttpError.Forbidden()
	}
	return tournament
}
