import { getTournamentAPI } from '../api/tournamentApi.js'
import { updateAllPlayerCards } from '../components/tournament/PlayerCard.js'
import { tournamentStore } from '../usecases/tournamentStore.js'
import { currentUser } from '../usecases/userStore.js'
import { notyfGlobal as notyf } from '../utils/notyf.js'
import { ToastActionType } from '../types/toast.js'

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
		console.log(result)
		if ([403, 401, 409, 404].includes(result.status)) {
			console.log('Not a participant, redirecting...')
			notyf.open({
				type: ToastActionType.ERROR_ACTION,
				message: result.error || "You're not a participant of this tournament"
			})
			window.navigate('/')
			return
		}
		if (result.error) {
			console.error('Error fetching tournament data:', result.error)
			return
		}

		const tournamentData = result.data
		// console.log('tournamentData', tournamentData)

		tournamentStore.status = tournamentData.tournament.status
		if (tournamentStore.status === 'completed') {
			console.log('Tournament completed, stopping polling.')
			return
		}

		await tournamentStore.syncPlayers(tournamentData.tournament.participants)

		updateAllPlayerCards('player_card_')

		pollingInterval = setTimeout(pollingTournament, 2000)
	} catch (error) {
		console.error('Error fetching tournament data:', error)
		pollingInterval = setTimeout(pollingTournament, 5000)
	}
}
