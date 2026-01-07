import { FastifyRequest } from 'fastify'
import {
	CreateTournamentSchema,
	TournamentDTO,
	CreateTournamentResponseDTO
} from '@ft_transcendence/common'
import { playerToGame, tournaments, usersToTournament } from '../gameData.js'
import { updateGameMetrics } from '../metricsService.js'
import { createInviteCode } from '../../createCode.js'
import createHttpError from 'http-errors'

export function createTournament(
	request: FastifyRequest
): CreateTournamentResponseDTO {
	const parsed = CreateTournamentSchema.safeParse(request.body)
	const userId = request.user.user_id
	if (userId === undefined) {
		throw createHttpError.Unauthorized()
	}
	if (usersToTournament.has(userId)) {
		const existingCode = usersToTournament.get(userId)
		const error = createHttpError.Conflict(
			'User is already in another tournament'
		)
		error.tournamentCode = existingCode
		throw error
	}
	if (playerToGame.has(userId)) {
		throw createHttpError.Conflict('User is already in a match')
	}
	if (!parsed.success) {
		throw createHttpError.BadRequest(parsed.error.message)
	}
	const invitCode = createInviteCode('T')
	const tournament: TournamentDTO = {
		status: 'pending',
		maxParticipants: parsed.data.numberOfPlayers,
		participants: [userId],
		matches: []
	}
	tournaments.set(invitCode, tournament)
	usersToTournament.set(userId, invitCode)

	updateGameMetrics()

	return { code: invitCode, tournament }
}
