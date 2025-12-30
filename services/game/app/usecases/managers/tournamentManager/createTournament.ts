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
import { getNextTournamentId } from '../../../repositories/matchsRepository.js'
import { updateGameMetrics } from '../metricsService.js'

export function initializeTournamentId(): void {
	nextTournamentId = getNextTournamentId()
	console.log(
		`[Tournament] Next tournament ID initialized to: ${nextTournamentId}`
	)
}

// Auto-incrementing tournament ID (initialized from DB)
let nextTournamentId = 1

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
		id: nextTournamentId++,
		status: 'pending',
		maxParticipants: parsed.data.numberOfPlayers,
		participants: [userId],
		matchs: []
	}
	tournaments.set(invitCode, tournament)

	updateGameMetrics()

	return { code: invitCode, tournament }
}
