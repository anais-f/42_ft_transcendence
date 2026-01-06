import { GetTournamentResponseDTO } from '@ft_transcendence/common'
import { tournamentStore } from '../../usecases/tournamentStore.js'
import { currentUser } from '../../usecases/userStore.js'
import {
	updateTournamentCellName,
	updateTournamentCellScore
} from '../../components/game/TournamentCell.js'
import { updatePlayerCard } from '../../components/tournament/PlayerCard.js'
import { waitingPlayer } from '../../pages/TournamentPage.js'

type Match = GetTournamentResponseDTO['tournament']['matchs'][number]

function getPlayerName(playerId: number | undefined): string {
	if (!playerId) return waitingPlayer
	return tournamentStore.playersMap.get(playerId)?.username || waitingPlayer
}

function updateMatchCell(
	cellId: string,
	playerId: number | undefined,
	score: number | undefined
): void {
	updateTournamentCellName(cellId, getPlayerName(playerId))
	if (score !== undefined) {
		updateTournamentCellScore(cellId, score, 5)
	}
}

function updateMatch(id: string, matchIndex: number, match: Match): void {
	updateMatchCell(`${id}${matchIndex}-p1`, match.player1Id, match.scorePlayer1)
	updateMatchCell(`${id}${matchIndex}-p2`, match.player2Id, match.scorePlayer2)
}

export function updateBracket(
	id: string,
	tournamentData: GetTournamentResponseDTO
): void {
	const { tournament } = tournamentData
	if (!['completed', 'ongoing'].includes(tournament.status)) return

	tournament.matchs.forEach((match, index) => updateMatch(id, index, match))

	const winnerId = tournament.matchs[2]?.winnerId
	if (winnerId) {
		updateTournamentCellName('final-winner', getPlayerName(winnerId))
	}
}

export function updateOpponent(tournamentData: GetTournamentResponseDTO): void {
	const match = tournamentData.tournament.matchs
		.slice()
		.reverse()
		.find(
			(m) =>
				m.player1Id === currentUser?.user_id ||
				m.player2Id === currentUser?.user_id
		)

	if (!match) return

	const opponentId =
		match.player1Id === currentUser?.user_id ? match.player2Id : match.player1Id

	if (!opponentId) return

	const opponent = tournamentStore.playersMap.get(opponentId)
	updatePlayerCard(
		'modal-opponent-card',
		opponent?.username || 'OPPONENT',
		opponent?.avatar || '/assets/images/loading.png'
	)
}
