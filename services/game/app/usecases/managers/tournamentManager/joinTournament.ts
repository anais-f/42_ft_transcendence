import { FastifyRequest } from 'fastify'
import createHttpError from 'http-errors'
import {
	tournaments,
	usersToTournament,
	playerToGame,
	busyPlayers
} from '../gameData.js'
import { CodeParamSchema } from '@ft_transcendence/common'
import { TournamentDTO } from '@ft_transcendence/common'
import { startTournament } from './startTournament.js'

export function joinTournament(request: FastifyRequest): TournamentDTO {
	const tournamentCode = CodeParamSchema.parse(request.params)

	const userId = request.user.user_id
	if (userId === undefined) throw createHttpError.Unauthorized()

	const tournament = tournaments.get(tournamentCode.code)
	if (!tournament) throw createHttpError.NotFound()

	if (tournament.participants.includes(userId)) return tournament

	if (usersToTournament.has(userId))
		throw createHttpError.Conflict('User is already in another tournament')
	if (playerToGame.has(userId))
		throw createHttpError.Conflict('User is already in a match')
	if (busyPlayers.has(userId)) throw createHttpError.Conflict('User is busy')

	if (tournament.participants.length >= tournament.maxParticipants)
		throw createHttpError.Conflict('Tournament is full')

	tournament.participants.push(userId)
	usersToTournament.set(userId, tournamentCode.code)
	if (tournament.participants.length === tournament.maxParticipants)
		startTournament(tournamentCode.code, tournament)

	return tournament
}
