import { getTournamentAPI } from '../api/tournamentApi.js'
import { updateAllPlayerCards } from '../components/tournament/PlayerCard.js'
import { tournamentStore } from '../usecases/tournamentStore.js'
import { currentUser } from '../usecases/userStore.js'
import { notyfGlobal as notyf } from '../utils/notyf.js'
import { ToastActionType } from '../types/toast.js'
import { IApiResponse } from '../types/api.js'
import {
	updateTournamentCellName,
	updateTournamentCellScore
} from '../components/game/TournamentCell.js'
import { waitingPlayer } from '../pages/TournamentPage.js'

export let pollingInterval: ReturnType<typeof setTimeout> | null

export function setPollingInterval(
	value: ReturnType<typeof setTimeout> | null
): void {
	pollingInterval = value
}

export async function pollingTournament() {
	try {
		if (!tournamentStore.tournamentCode) return
		const result = await getTournamentAPI(tournamentStore.tournamentCode)
		// console.log(result)
		if (errorGetTournament(result)) return

		const tournamentData = result.data
		console.log('tournamentData', tournamentData)

		tournamentStore.status = tournamentData.tournament.status

		updateMatches('match', tournamentData)

		await tournamentStore.syncPlayers(tournamentData.tournament.participants)

		updateAllPlayerCards('player_card_')

		if (tournamentStore.status === 'completed') {
			console.log('Tournament completed, stopping polling.')
			return
		}

		pollingInterval = setTimeout(pollingTournament, 2000)
	} catch (error) {
		console.error('Error fetching tournament data:', error)
		pollingInterval = setTimeout(pollingTournament, 5000)
	}
}

function errorGetTournament(result: IApiResponse): boolean {
	if ([403, 401, 409, 404].includes(result.status)) {
		console.log('Not a participant, redirecting...')
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: result.error || "You're not a participant of this tournament"
		})
		window.navigate('/')
		return true
	}
	if (result.error) {
		console.error('Error fetching tournament data:', result.error)
		return true
	}
	return false
}

// TODO: type ALL tournamentData
function updateMatches(id: string, tournamentData: any) {
	const tournament = tournamentData.tournament
	if (
		!tournament ||
		!['completed', 'ongoing'].includes(tournamentStore.status)
	) {
		return
	}

	for (let matchIndex = 0; matchIndex < 3; ++matchIndex) {
		for (let playerIndex = 0; playerIndex < 2; ++playerIndex) {
			// update Name
			const p = tournamentStore.playersMap.get(
				tournament.matchs[matchIndex][`player${playerIndex + 1}Id`]
			)
			updateTournamentCellName(
				`${id}${matchIndex}-p${playerIndex + 1}`,
				p?.username || waitingPlayer
			)

			// update Score
			const score =
				tournament.matchs[matchIndex][`scorePlayer${playerIndex + 1}`]
			if (score !== undefined) {
				const scoreId = `${id}${matchIndex}-p${playerIndex + 1}`
				updateTournamentCellScore(scoreId, score, 5)
			}
		}
	}

	const winnderId = tournament.matchs[2]?.winnerId
	if (!winnderId) {
		return
	}

	const winner = tournamentStore.playersMap.get(winnderId)
	updateTournamentCellName('final-winner', winner?.username || waitingPlayer)
}
