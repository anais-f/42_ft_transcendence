import {
	CodeParamSchema,
	Tournament,
	CreateTournamentSchema
} from '@ft_transcendence/common'
import createHttpError from 'http-errors'
import { FastifyRequest } from 'fastify'
import {
	games,
	playerToGame,
	tournaments,
	usersInTournaments
} from './managers/gameData.js'
import { requestGame } from './managers/gameManager/requestGame.js'
import { MatchTournament } from '@ft_transcendence/common'

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
	let code: string = ''

	do {
		code = `${type}-${randomAlphaNumeric(5)}`
	} while (games.has(code) || tournaments.has(code))

	return code
}

function shuffle(array: any[]) {
	let currentIndex = array.length

	while (currentIndex != 0) {
		let randomIndex = Math.floor(Math.random() * currentIndex)
		currentIndex--
		;[array[currentIndex], array[randomIndex] ] = [
			array[randomIndex],
			array[currentIndex]
		]
	}
}

function startNextRound(tournament: Tournament, round: number) {
	const roundMatches = tournament.matchs.filter(
		(match) => match.round === round
	)
	roundMatches.forEach((match) => {
		if (
			match.player1Id === undefined ||
			match.player2Id === undefined
		) {
			console.error('Invalid match data for next round:', match)
			return // Skip ce match
		}
		match.status = 'ongoing'
		requestGame(match.player1Id, match.player2Id)
	})
}


export function startTournament(tournament: Tournament) {
	tournament.status = 'ongoing'
	createTournamentTree(tournament)
	// Only start the first round (highest round number)
	const firstRound = Math.log2(tournament.maxParticipants)
	startNextRound(tournament, firstRound)
}

function createTournamentTree(tournament: Tournament) {
	if (!tournament) {
		throw new Error('Tournament not found')
	}
	console.log('Before shuffle:', tournament.participants)
	shuffle(tournament.participants)
	console.log('Shuffled participants:', tournament.participants)
	if (tournament.participants.length !== tournament.maxParticipants) {
		throw createHttpError.Conflict('Not enough participants to create the tournament tree')
	}
	let maxRound = Math.log2(tournament.maxParticipants)
	for (let match = 0; match < tournament.maxParticipants / 2; match++) {
		const player1Index = match * 2
		const player2Index = player1Index + 1
		const player1 = tournament.participants[player1Index]
		const player2 = tournament.participants[player2Index]
		if (player1 === undefined || player2 === undefined) {
			throw createHttpError.InternalServerError(`Invalid participant indices: ${player1Index}, ${player2Index}`)
		}
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
	tournament.participants.forEach((userId) => {
		usersInTournaments.delete(userId)
	})
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
	if (tournament.participants.length === tournament.maxParticipants) {
			startTournament(tournament)
	}
	return tournament
}

let nextTournamentId = 1

export function createTournament(
	request: FastifyRequest
) {
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
	return {"code": invitCode,
			"tournament": tournaments.get(invitCode)
		}
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

export function quitTournament(request: FastifyRequest): void {
	const userId = request.user.user_id
	if (userId === undefined) {
		throw createHttpError.Unauthorized()
	}
	const tournamentCode = CodeParamSchema.parse(request.params)
	const tournament = tournaments.get(tournamentCode.code)
	if (!tournament) {
		throw createHttpError.NotFound()
	}
	const participantIndex = tournament.participants.indexOf(userId)
	if (participantIndex === -1) {
		throw createHttpError.Forbidden()
	}
	if (tournament.status !== 'pending') {
		throw createHttpError.Conflict(
			'Cannot quit a tournament that has already started'
		)
	}
	tournament.participants.splice(participantIndex, 1)
	usersInTournaments.delete(userId)
}

export function onTournamentMatchEnd(
	tournamentCode: string,
	round: number,
	matchNumber: number,
	winnerId: number,
	scorePlayer1: number,
	scorePlayer2: number
): void {
	const tournament = tournaments.get(tournamentCode)
	if (!tournament) {
		throw createHttpError.NotFound('Tournament not found')
	}

	// Find the match that just ended
	const currentMatch = tournament.matchs.find(
		(m) => m.round === round && m.matchNumber === matchNumber
	)
	if (!currentMatch) {
		throw createHttpError.NotFound('Match not found')
	}

	// Update match status and scores
	currentMatch.status = 'completed'
	currentMatch.scorePlayer1 = scorePlayer1
	currentMatch.scorePlayer2 = scorePlayer2

	// If this was the final (round 1), tournament is over
	if (round === 1) {
		tournament.status = 'completed'
		console.log(`Tournament ${tournamentCode} completed! Winner: ${winnerId}`)
		
		// Clean up participants from tracking
		tournament.participants.forEach((userId) => {
			usersInTournaments.delete(userId)
		})
		return
	}

	// Find the next round match that this winner should advance to
	const nextRoundMatch = tournament.matchs.find(
		(m) =>
			m.round === round - 1 &&
			(m.previousMatchId1 === matchNumber ||
				m.previousMatchId2 === matchNumber)
	)

	if (!nextRoundMatch) {
		console.error('No next round match found for winner')
		return
	}

	// Place winner in the appropriate slot of next match
	if (nextRoundMatch.previousMatchId1 === matchNumber) {
		nextRoundMatch.player1Id = winnerId
	} else if (nextRoundMatch.previousMatchId2 === matchNumber) {
		nextRoundMatch.player2Id = winnerId
	}

	console.log(
		`Winner ${winnerId} advanced to round ${nextRoundMatch.round}, match ${nextRoundMatch.matchNumber}`
	)

	// Check if both players are ready for the next match
	if (
		nextRoundMatch.player1Id !== undefined &&
		nextRoundMatch.player2Id !== undefined &&
		nextRoundMatch.status === 'waiting_for_players'
	) {
		// Both players ready, start the match!
		nextRoundMatch.status = 'ongoing'
		console.log(
			`Starting next round match: ${nextRoundMatch.player1Id} vs ${nextRoundMatch.player2Id}`
		)
		requestGame(nextRoundMatch.player1Id, nextRoundMatch.player2Id)
	}
}

/**
 * Helper to get tournament code from a user or game
 */
export function getTournamentByUser(userId: number): string | undefined {
	for (const [code, tournament] of tournaments.entries()) {
		if (tournament.participants.includes(userId)) {
			return code
		}
	}
	return undefined
}

/**
 * Get tournament code by tournament ID
 */
export function getTournamentCodeById(tournamentId: number): string | undefined {
	for (const [code, tournament] of tournaments.entries()) {
		if (tournament.id === tournamentId) {
			return code
		}
	}
	return undefined
}
