import { FastifyReply, FastifyRequest } from 'fastify'
import {
	CreateTournamentSchema,
	CodeParamSchema
} from '@ft_transcendence/common'
import { tournaments, usersInTournaments } from '../tournament/tournamentData.js'
import { playerToGame } from '../game/gameManager/gamesData.js'
import {
	createTournamentTree,
	createInviteCode
} from '../usecases/tournamentUsecases.js'

let nextTournamentId = 1

export function getTournamentController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const userId = request.user.user_id
	if (userId === undefined) {
		return reply.status(401).send({ error: 'Unauthorized' })
	}
	const tournamentCode = CodeParamSchema.parse(request.params)
	const tournament = tournaments.get(tournamentCode.code)
	if (!tournament) {
		return reply.status(404).send({ error: 'Tournament not found' })
	}
	if (!tournament.participants.includes(userId)) {
		return reply.status(403).send({ error: 'Access denied to this tournament' })
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
		return reply
			.status(409)
			.send({ error: 'User is already in another tournament' })
	}
	if (playerToGame.has(userId)) {
		return reply.status(409).send({ error: 'User is already in a match' })
	}
	if (!parsed.success) {
		return reply.status(400).send({ error: parsed.error })
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
		return reply.status(401).send({ error: 'Unauthorized' })
	}
	if (usersInTournaments.has(userId)) {
		return reply
			.status(409)
			.send({ error: 'User is already in another tournament' })
	}
	if (playerToGame.has(userId)) {
		return reply.status(409).send({ error: 'User is already in a match' })
	}
	const tournament = tournaments.get(tournamentCode.code)
	if (!tournament) {
		return reply.status(404).send({ error: 'Tournament not found' })
	}
	if (tournament.participants.length >= tournament.maxParticipants) {
		return reply.status(409).send({ error: 'Tournament is full' })
	}
	if (tournament.participants.includes(userId)) {
		return reply
			.status(409)
			.send({ error: 'User already joined the tournament' })
	}
	tournament.participants.push(userId)
	return reply.send({ success: true, tournament })
}
