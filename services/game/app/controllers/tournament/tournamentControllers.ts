import { FastifyReply, FastifyRequest } from 'fastify'
import {
	joinTournament,
	createTournament,
	getTournament,
	quitTournament
} from '../../usecases/tournamentUsecases.js'

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

export function quitTournamentController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	quitTournament(request)
	return reply.send({ success: true })
}
