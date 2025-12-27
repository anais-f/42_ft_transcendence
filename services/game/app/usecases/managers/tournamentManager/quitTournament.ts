import { CodeParamSchema } from '@ft_transcendence/common'
import createHttpError from 'http-errors'
import { FastifyRequest } from 'fastify'
import { tournaments, usersInTournaments } from '../gameData.js'

export function quitTournament(request: FastifyRequest): void {
	const userId = request.user.user_id
	if (userId === undefined) {
		throw createHttpError.Unauthorized()
	}
	const tournamentCode = CodeParamSchema.parse(request.params)
	const tournament = tournaments.get(tournamentCode.code)
	if (!tournament) {
		throw createHttpError.NotFound()
	}
	const participantIndex = tournament.participants.indexOf(userId)
	if (participantIndex === -1) {
		throw createHttpError.Forbidden()
	}
	if (tournament.status !== 'pending') {
		throw createHttpError.Conflict(
			'Cannot quit a tournament that has already started'
		)
	}
	tournament.participants.splice(participantIndex, 1)
	usersInTournaments.delete(userId)
	if (tournament.participants.length === 0) {
		tournaments.delete(tournamentCode.code)
	}
}
