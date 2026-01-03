import { FastifyRequest } from 'fastify'
import {
	CreateTournamentSchema,
	TournamentDTO,
	CreateTournamentResponseDTO
} from '@ft_transcendence/common'
import {
	games,
	playerToGame,
	tournaments,
	usersInTournaments
} from '../gameData.js'
import { createInviteCode } from '../../../utils/createCode.js'
import createHttpError from 'http-errors'
import { updateGameMetrics } from '../metricsService.js'

export function createTournament(
	request: FastifyRequest
): CreateTournamentResponseDTO {
	const parsed = CreateTournamentSchema.safeParse(request.body)
	const userId = request.user.user_id
	if (userId === undefined) {
		throw createHttpError.Unauthorized()
	}
	if (usersInTournaments.has(userId)) {
		throw createHttpError.Conflict('User is already in another tournament')
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
		matchs: []
	}
	tournaments.set(invitCode, tournament)
	usersInTournaments.add(userId)

	updateGameMetrics()

	return { code: invitCode, tournament }
}
