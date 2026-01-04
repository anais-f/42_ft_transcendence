import { CreateTournamentAPI } from '../../api/tournamentApi.js'
import { tournamentStore } from '../../usecases/tournamentStore.js'
import { sendGameError } from './errorMapUtils.js'

export async function handleCreateTournament() {
	const { data, error, status } = await CreateTournamentAPI()

	if (error) {
		sendGameError(error, status)
		return
	}

	const code = data.code
	tournamentStore.tournamentCode = code
	tournamentStore.status = 'pending'

	window.navigate(`/tournament/${code}`)
}
