import { getTournamentAPI } from '../api/tournamentApi.js'
import { updateAllPlayerCards } from '../components/tournament/PlayerCard.js'
import { tournamentStore } from '../usecases/tournamentStore.js'
import { currentUser } from '../usecases/userStore.js'

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
		if (result.error) {
			console.error('Error fetching tournament data:', result.error)
			return
		}

		const tournamentData = result.data
		console.log('tournamentData', tournamentData)

		const isParticipant = tournamentData.tournament.participants.includes(
			currentUser?.user_id
		)
		if (!isParticipant) {
			console.log('Not a participant, redirecting...')
			window.navigate('/')
			return
		}

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
