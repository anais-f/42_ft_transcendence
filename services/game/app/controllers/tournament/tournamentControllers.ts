import { FastifyReply, FastifyRequest } from 'fastify'
import {
	joinTournament,
	createTournament,
	getTournament,
	quitTournament
} from '../../usecases/tournamentUsecases.js'
import {
	GetTournamentResponseDTO,
	CreateTournamentResponseDTO,
	JoinTournamentResponseDTO
} from '@ft_transcendence/common'

export function getTournamentController(
	request: FastifyRequest,
	reply: FastifyReply
): GetTournamentResponseDTO {
	const tournament = getTournament(request)
	return { tournament }
}

export function createTournamentController(
	request: FastifyRequest,
	reply: FastifyReply
): CreateTournamentResponseDTO {
	return createTournament(request)
}

export function joinTournamentController(
	request: FastifyRequest,
	reply: FastifyReply
): JoinTournamentResponseDTO {
	const tournament = joinTournament(request)
	return { tournament }
}

export function quitTournamentController(
	request: FastifyRequest,
	reply: FastifyReply
): void {
	quitTournament(request)
	return
}
