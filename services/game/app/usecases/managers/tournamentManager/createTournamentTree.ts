import createHttpError from 'http-errors'
import { Tournament } from '@ft_transcendence/common'

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

export function createTournamentTree(tournament: Tournament) {
	if (!tournament) {
		throw new Error('Tournament not found')
	}
	shuffle(tournament.participants)
	if (tournament.participants.length !== tournament.maxParticipants) {
		throw createHttpError.Conflict(
			'Not enough participants to create the tournament tree'
		)
	}
	let maxRound = Math.log2(tournament.maxParticipants)
	for (let match = 0; match < tournament.maxParticipants / 2; match++) {
		const player1Index = match * 2
		const player2Index = player1Index + 1
		const player1 = tournament.participants[player1Index]
		const player2 = tournament.participants[player2Index]
		if (player1 === undefined || player2 === undefined) {
			throw createHttpError.InternalServerError(
				`Invalid participant indices: ${player1Index}, ${player2Index}`
			)
		}
		tournament.matches.push({
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
		for (let match = 0; match < matchesInRound; match++) {
			tournament.matches.push({
				previousMatchId1: match * 2,
				previousMatchId2: match * 2 + 1,
				round: round,
				matchNumber: match,
				status: 'waiting_for_players'
			})
		}
	}
}
