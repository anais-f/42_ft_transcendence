import createHttpError from 'http-errors'
import { FastifyRequest } from 'fastify'
import { tournaments, usersToTournament } from '../gameData.js'

/**
 * Quit tournament by userId
 * Throws errors if user is not in a tournament or tournament has already started
 */
export function quitTournamentByUserId(userId: number): void {
	const tournamentCode = usersToTournament.get(userId)
	if (!tournamentCode) {
		throw createHttpError.NotFound('User is not in any tournament')
	}
	const tournament = tournaments.get(tournamentCode)
	if (!tournament) {
		throw createHttpError.NotFound('Tournament not found')
	}
	if (tournament.status !== 'pending') {
		throw createHttpError.Conflict(
			"You can't quit a tournament that has already started"
		)
	}
	const participantIndex = tournament.participants.indexOf(userId)
	if (participantIndex !== -1) {
		tournament.participants.splice(participantIndex, 1)
	}
	usersToTournament.delete(userId)
	if (tournament.participants.length === 0) {
		tournaments.delete(tournamentCode)
	}
}

/**
 * HTTP handler for quitting tournament
 */
export function quitTournament(request: FastifyRequest): void {
	const userId = request.user.user_id
	if (userId === undefined) {
		throw createHttpError.Unauthorized()
	}
	quitTournamentByUserId(userId)
}
