import { FastifyReply, FastifyRequest } from 'fastify'
import {
	CreateTournamentSchema,
	CodeParamSchema
} from '@ft_transcendence/common'
import { tournaments, usersInTournaments } from '../tournament/tournamentData.js'
import { playerToGame } from '../game/gameManager/gamesData.js'
import {createInviteCode} from '../usecases/tournamentUsecases.js'
import createHttpError from 'http-errors'

let nextTournamentId = 1

export function getTournamentController(
	request: FastifyRequest,
	reply: FastifyReply
) {
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
	return reply.send({ success: true, tournament })
}

export function createTournamentController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = CreateTournamentSchema.safeParse(request.body)
	const userId = request.user.user_id
	if (userId === undefined) {
		return reply.status(401).send({ error: 'Unauthorized' })
	}
	if (usersInTournaments.has(userId)) {
		throw createHttpError.Conflict('User is already in another tournament')
	}
	if (usersInMatch.has(userId)) {
		throw createHttpError.Conflict('User is already in a match')
	}
	if (!parsed.success) {
		throw createHttpError.BadRequest(parsed.error.message)
	}
	const invitCode = createInviteCode('T')
	tournaments.set(invitCode, {
		id: nextTournamentId,
		status: 'pending',
		maxParticipants: parsed.data.numberOfPlayers,
		participants: [userId],
		matchs: []
	})
	return reply.send(tournaments.get(invitCode))
}

export function joinTournamentController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const tournamentCode = CodeParamSchema.parse(request.params)
	const userId = request.user.user_id
	if (userId === undefined) {
		throw createHttpError.Unauthorized()
	}
	if (usersInTournament.has(userId)) {
			throw createHttpError.Conflict('User is already in another tournament')
	}
	if (usersInMatch.has(userId)) {
		throw createHttpError.Conflict('User is already in a match')
	}
	const tournament = tournaments.get(tournamentCode.code)
	if (!tournament) {
		throw createHttpError.NotFound()
	}
	if (tournament.participants.length >= tournament.maxParticipants) {
		throw createHttpError.Conflict('Tournament is full')
	}
	if (tournament.participants.includes(userId)) {
		throw createHttpError.Conflict('User already joined the tournament')
	}
	tournament.participants.push(userId)
	return reply.send({ success: true, tournament })
}
