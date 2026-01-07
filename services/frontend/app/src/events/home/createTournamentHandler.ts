import { createTournamentAPI } from '../../api/tournamentApi.js'
import { tournamentStore } from '../../usecases/tournamentStore.js'
import { sendGameError } from './errorMapUtils.js'
import { showRejoinTournamentModal } from './rejoinTournamentModalHandler.js'

export async function handleCreateTournament() {
	const { data, error, status } = await createTournamentAPI()

	if (error) {
		if (data?.tournamentCode) {
			showRejoinTournamentModal(data?.tournamentCode)
			return
		}
		sendGameError(error, status)
		return
	}

	const code = data.code
	tournamentStore.tournamentCode = code
	tournamentStore.status = 'pending'

	window.navigate(`/tournament/${code}`)
}
