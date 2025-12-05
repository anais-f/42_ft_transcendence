import { tournaments } from '../index.js'

function randomAlphaNumeric(length: number): string {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
	let s = ''
	for (let i = 0; i < length; i++) {
		s += chars.charAt(Math.floor(Math.random() * chars.length))
	}
	return s
}

export function createInviteCode(): string {
	const str1: string = randomAlphaNumeric(4)
	const str2: string = randomAlphaNumeric(4)
	for (const tournament of tournaments.values())
		if (tournament.name === str1 + '-' + str2) return createInviteCode()
	return str1 + '-' + str2
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

export function createTournamentTree(id: number) {
	const tournament = tournaments.get(id)
	if (!tournament) {
		throw new Error('Tournament not found')
	}
	console.log('Before shuffle:', tournament.participants)
	shuffle(tournament.participants)
	console.log('Shuffled participants:', tournament.participants)
	if (!tournament) {
		throw new Error('Tournament not found')
	}
	if (tournament.participants.length !== tournament.maxParticipants) {
		throw new Error('Not enough participants to create the tournament tree')
	}
	if (tournament.status !== 'ongoing') {
		throw new Error('Tournament is not ongoing')
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
			player1Id: tournament.participants[player1Index],
			player2Id: tournament.participants[player2Index],
			status: 'pending'
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
