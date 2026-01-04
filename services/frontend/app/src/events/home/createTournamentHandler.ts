import { CreateTournamentAPI } from '../../api/tournamentApi.js'
import { tournamentStore } from '../../usecases/tournamentStore.js'
import { notyfGlobal as notyf } from '../../utils/notyf.js'
import { ToastActionType } from '../../types/toast.js'

export async function handleCreateTournament() {
	const { data, error, status } = await CreateTournamentAPI()
	if (error) {
		console.error(`Failed to create tournament: ${error} (status: ${status})`)
		notyf.open({
			type: ToastActionType.ERROR_ACTION,
			message: error || 'Failed to create tournament'
		})
		return
	}

	const code = data.code
	tournamentStore.tournamentCode = code
	tournamentStore.status = 'pending'

	window.navigate(`/tournament/${code}`)
}
