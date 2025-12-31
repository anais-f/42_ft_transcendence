import { fetchCreateTournament } from '../../api/tournamentApi.js'
import { tournamentStore } from '../../usecases/tournamentStore.js'
import { notyfGlobal as notyf } from '../../utils/notyf.js'
import { ToastActionType } from '../../types/toast.js'
import { currentUser } from '../../usecases/userStore.js'

export async function handleCreateTournament() {
	const { data, error, status } = await fetchCreateTournament()
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
	const player = {
		username: currentUser?.username ?? 'you',
		avatar: currentUser?.avatar ?? '/avatars/img_default.png'
	}
	tournamentStore.nextSlot = player
	window.navigate(`/tournament/${code}`)
}
