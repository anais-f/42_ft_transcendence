import { GetTournamentResponseDTO } from '@ft_transcendence/common'
import { tournamentStore } from '../../usecases/tournamentStore.js'
import { currentUser } from '../../usecases/userStore.js'
import { gameStore } from '../../usecases/gameStore.js'
import { handleJoinGameTournament } from '../../events/tournament/gameTournament.js'
import { initGameWS } from '../network/initGameWS.js'
import { showModal } from '../../components/modals/Modal.js'
import { NEXT_MATCH_MODAL_ID } from '../../components/modals/nextMatchModal.js'
import { notyfGlobal as notyf } from '../../utils/notyf.js'
import { ToastActionType } from '../../types/toast.js'

type Match = GetTournamentResponseDTO['tournament']['matchs'][number]

function findPendingUserMatch(
	tournament: GetTournamentResponseDTO['tournament']
): Match | null {
	if (!currentUser?.user_id) return null

	for (const match of tournament.matchs) {
		if (!match.gameCode) continue
		if (match.winnerId !== undefined) continue
		if (tournamentStore.hasJoinedGame(match.gameCode)) continue

		const isUserInMatch =
			match.player1Id === currentUser.user_id ||
			match.player2Id === currentUser.user_id

		if (isUserInMatch) return match
	}
	return null
}

async function joinMatch(
	gameCode: string,
	onStopPolling: () => void
): Promise<void> {
	tournamentStore.markGameAsJoined(gameCode)
	showModal(NEXT_MATCH_MODAL_ID)

	const result = await handleJoinGameTournament(gameCode)

	if (result.alreadyInGame) {
		onStopPolling()
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: 'Tournament is already active in another tab!'
		})
		setTimeout(() => window.navigate('/'), 2000)
		return
	}

	if (!result.success) {
		tournamentStore.unmarkGameAsJoined(gameCode)
		return
	}

	initGameWS(`/tournament/${tournamentStore.tournamentCode}`)
}

export async function checkAndJoinUserMatches(
	tournament: GetTournamentResponseDTO['tournament'],
	onStopPolling: () => void
): Promise<void> {
	if (!['completed', 'ongoing'].includes(tournament.status)) return
	if (gameStore.gameCode) return

	const match = findPendingUserMatch(tournament)
	if (!match?.gameCode) return

	console.log('[TournamentMatchJoin] Joining match:', match.gameCode)
	await joinMatch(match.gameCode, onStopPolling)
}
