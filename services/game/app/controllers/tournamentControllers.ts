import { FastifyReply, FastifyRequest } from 'fastify'
import {
	CreateTournamentSchema,
	IdParamSchema,
	RemoveTournamentSchema
} from '@ft_transcendence/common'
import { tournaments } from '../index.js'
import {
	createTournamentTree,
	createInviteCode
} from '../usecases/tournamentUsecases.js'

let nextTournamentId = 1

export function deleteTournamentController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const userId = request.user.user_id
	if (userId === undefined) {
		return reply.status(401).send({ error: 'Unauthorized' })
	}
	const tournamentId = IdParamSchema.parse(request.params)
	const tournament = tournaments.get(Number(tournamentId.id))
	if (!tournament) {
		return reply.status(404).send({ error: 'Tournament not found' })
	}
	if (userId != tournament.creatorId)
		return reply
			.status(403)
			.send({ error: 'Only the creator can delete the tournament' })
	tournaments.delete(tournament.id)
	return reply.send({ success: true })
}

export function getTournamentController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const userId = request.user.user_id
	if (userId === undefined) {
		return reply.status(401).send({ error: 'Unauthorized' })
	}
	const tournamentId = IdParamSchema.parse(request.params)
	const tournament = tournaments.get(Number(tournamentId.id))
	if (!tournament) {
		return reply.status(404).send({ error: 'Tournament not found' })
	}
	if (!tournament.participants.includes(userId)) {
		return reply.status(403).send({ error: 'Access denied to this tournament' })
	}
	return reply.send({ success: true, tournament })
}

export function removeFromTournamentController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const userId = request.user.user_id
	if (userId === undefined) {
		return reply.status(401).send({ error: 'Unauthorized' })
	}
	const tournamentId = IdParamSchema.parse(request.params)
	const parsed = RemoveTournamentSchema.safeParse(request.body)
	if (!parsed.success) {
		return reply.status(400).send({ error: parsed.error })
	}
	const tournament = tournaments.get(Number(tournamentId.id))
	if (!tournament) {
		return reply.status(404).send({ error: 'Tournament not found' })
	}
	if (userId != tournament.creatorId)
		return reply
			.status(403)
			.send({ error: 'Only the creator can remove participants' })
	const participantIndex = tournament.participants.indexOf(parsed.data.userId)
	if (participantIndex === -1) {
		return reply.status(400).send({ error: 'User is not in the tournament' })
	}
	tournament.participants.splice(participantIndex, 1)
	tournament.participantsBan.push(parsed.data.userId)
	return reply.send({ success: true, tournament })
}

export function startTournamentController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const tournamentId = IdParamSchema.parse(request.params)
	const tournament = tournaments.get(Number(tournamentId.id))
	if (!tournament) {
		return reply.status(404).send({ error: 'Tournament not found' })
	}
	if (tournament.status !== 'pending') {
		return reply
			.status(400)
			.send({ error: 'Tournament has already started or finished' })
	}
	if (tournament.participants.length != tournament.maxParticipants) {
		return reply
			.status(400)
			.send({ error: 'Not enough participants to start the tournament' })
	}
	tournament.status = 'ongoing'
	createTournamentTree(tournament.id)
	return reply.send({ success: true, tournament })
}

export function createTournamentController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = CreateTournamentSchema.safeParse(request.body)
	if (!parsed.success) {
		return reply.status(400).send({ error: parsed.error })
	}
	//verifier id creator
	for (const tournament of tournaments.values()) {
		for (const participant of tournament.participants) {
			if (participant === parsed.data.creatorId) {
				return reply
					.status(400)
					.send({ error: 'User is already in another tournament' })
			}
		}
	}
	tournaments.set(nextTournamentId, {
		id: nextTournamentId,
		creatorId: parsed.data.creatorId,
		name: createInviteCode(),
		status: 'pending',
		maxParticipants: parsed.data.numberOfPlayers,
		participants: [parsed.data.creatorId],
		participantsBan: [],
		matchs: []
	})
	return reply.send(tournaments.get(nextTournamentId++))
}

export function joinTournamentController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const tournamentId = IdParamSchema.parse(request.params)
	const userId = request.user.user_id
	if (userId === undefined) {
		return reply.status(401).send({ error: 'Unauthorized' })
	}
	//verifier id user
	for (const tournament of tournaments.values()) {
		for (const participant of tournament.participants) {
			if (participant === userId) {
				return reply
					.status(400)
					.send({ error: 'User is already in another tournament' })
			}
		}
	}
	const tournament = tournaments.get(Number(tournamentId.id))
	if (!tournament) {
		return reply.status(404).send({ error: 'Tournament not found' })
	}
	if (tournament.participantsBan.includes(userId) == true) {
		return reply.status(403).send({ error: 'User is ban from this tournament' })
	}
	if (tournament.participants.length >= tournament.maxParticipants) {
		return reply.status(400).send({ error: 'Tournament is full' })
	}
	if (tournament.participants.includes(userId)) {
		return reply
			.status(400)
			.send({ error: 'User already joined the tournament' })
	}
	tournament.participants.push(userId)
	return reply.send({ success: true, tournament })
}
