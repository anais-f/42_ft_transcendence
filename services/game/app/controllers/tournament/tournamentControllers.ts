import { FastifyReply, FastifyRequest } from 'fastify'
import { getTournament } from '../../usecases/managers/tournamentManager/getTournament.js'
import { createTournament } from '../../usecases/managers/tournamentManager/createTournament.js'
import { joinTournament } from '../../usecases/managers/tournamentManager/joinTournament.js'
import { quitTournament } from '../../usecases/managers/tournamentManager/quitTournament.js'
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
