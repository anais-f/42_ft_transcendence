export type Tournament = {
	status: 'pending' | 'ongoing' | 'completed'
	maxParticipants: number
	participants: number[]
	matchs: MatchTournament[]
}

export type MatchTournament = {
	previousMatchId1?: number
	previousMatchId2?: number
	round: number
	matchNumber: number
	player1Id?: number
	player2Id?: number
	status: 'ongoing' | 'completed' | 'waiting_for_players'
	scorePlayer1?: number
	scorePlayer2?: number
}
