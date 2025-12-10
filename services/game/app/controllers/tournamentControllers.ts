import { FastifyReply, FastifyRequest } from 'fastify'
import {
	CreateTournamentSchema,
	CodeParamSchema
} from '@ft_transcendence/common'
import {
	tournaments,
	usersInTournaments
} from '../tournament/tournamentData.js'
import { playerToGame } from '../game/gameManager/gamesData.js'
import { createInviteCode } from '../usecases/tournamentUsecases.js'
import createHttpError from 'http-errors'
import {
	joinTournament,
	createTournament,
	getTournament
} from '../usecases/tournamentUsecases.js'

export function getTournamentController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const tournament = getTournament(request)
	return reply.send({ success: true, tournament })
}

export function createTournamentController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const tournament = createTournament(request)
	return reply.send(tournament)
}

export function joinTournamentController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const tournament = joinTournament(request)
	return reply.send({ success: true, tournament })
}
