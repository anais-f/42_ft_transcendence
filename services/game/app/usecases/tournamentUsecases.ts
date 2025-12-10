import { tournaments } from '../tournament/tournamentData.js'
import { games } from '../game/gameManager/gamesData.js'
import {
	CodeParamSchema,
	Tournament,
	CreateTournamentSchema
} from '@ft_transcendence/common'
import createHttpError from 'http-errors'
import { usersInTournaments } from '../tournament/tournamentData.js'
import { playerToGame } from '../game/gameManager/gamesData.js'
import { FastifyRequest } from 'fastify'

function randomAlphaNumeric(length: number): string {
	let code: string
	const uuid = crypto
		.randomUUID()
		.replace(/[\-0o]/g, '')
		.toUpperCase()
	code = uuid.slice(0, length)
	return code
}

export function createInviteCode(type: string): string {
	if (type !== 'T' && type !== 'G') throw new Error('Invalid tournament type')
	const str: string = randomAlphaNumeric(5)
	if (type === 'T' && tournaments.get(type + '-' + str))
		return createInviteCode(type)
	else if (type === 'G' && games.get(type + '-' + str))
		return createInviteCode(type)
	return type + '-' + str
}

function shuffle(array: any[]) {
	let currentIndex = array.length

	while (currentIndex != 0) {
		let randomIndex = Math.floor(Math.random() * currentIndex)
		currentIndex--
		;[array[currentIndex], array[randomIndex]] = [
			array[randomIndex],
			array[currentIndex]
		]
	}
}

export function startTournament(tournamentName: string) {
	const tournament = tournaments.get(tournamentName)
	if (!tournament) {
		throw new Error('Tournament not found')
	}
	tournament.status = 'ongoing'
	createTournamentTree(tournamentName)
}

export function createTournamentTree(tournamentName: string) {
	const tournament = tournaments.get(tournamentName)
	if (!tournament) {
		throw new Error('Tournament not found')
	}
	console.log('Before shuffle:', tournament.participants)
	shuffle(tournament.participants)
	console.log('Shuffled participants:', tournament.participants)
	if (tournament.participants.length !== tournament.maxParticipants) {
		throw new Error('Not enough participants to create the tournament tree')
	}
	let maxRound = Math.log2(tournament.maxParticipants)
	for (let match = 0; match < tournament.maxParticipants / 2; match++) {
		const player1Index = match * 2
		const player2Index = player1Index + 1
		const player1 = tournament.participants[player1Index]
		const player2 = tournament.participants[player2Index]
		tournament.matchs.push({
			round: maxRound,
			matchNumber: match,
			player1Id: player1,
			player2Id: player2,
			status: 'ongoing'
		})
	}
	for (let round = maxRound - 1; round > 0; --round) {
		const matchesInRound =
			tournament.maxParticipants / 2 ** (maxRound - round + 1)
		console.log(
			'Creating matches for round',
			round,
			'with',
			matchesInRound,
			'matches'
		)
		for (let match = 0; match < matchesInRound; match++) {
			tournament.matchs.push({
				previousMatchId1: match * 2,
				previousMatchId2: match * 2 + 1,
				round: round,
				matchNumber: match,
				status: 'waiting_for_players'
			})
		}
	}
	console.log('Tournament Matches:', tournament.matchs)
	console.log('Tournament tree created successfully')
}

export function deleteTournament(tournamentCode: string) {
	const tournament = tournaments.get(tournamentCode)
	if (!tournament) {
		throw new Error('Tournament not found')
	}

	tournaments.delete(tournamentCode)
}

export function joinTournament(request: FastifyRequest): Tournament {
	const tournamentCode = CodeParamSchema.parse(request.params)
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
	return tournament
}

let nextTournamentId = 1

export function createTournament(
	request: FastifyRequest
): Tournament | undefined {
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
	tournaments.set(invitCode, {
		id: nextTournamentId,
		status: 'pending',
		maxParticipants: parsed.data.numberOfPlayers,
		participants: [userId],
		matchs: []
	})
	return tournaments.get(invitCode)
}

export function getTournament(request: FastifyRequest): Tournament {
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
	return tournament
}
