import { gameStore } from '../../usecases/gameStore.js'
import { createGameAPI, MapOptions } from '../../api/game/createGame.js'
import { joinGameAPI } from '../../api/game/joinGame.js'
import { sendGameError } from './errorMapUtils.js'
import { showRejoinTournamentModal } from './rejoinTournamentModalHandler.js'

export async function handleCreateGame(mapOptions?: MapOptions) {
	const { data, error, status } = await createGameAPI(mapOptions)

	if (error) {
		if (data?.tournamentCode) {
			showRejoinTournamentModal(data?.tournamentCode)
			return
		}
		sendGameError(error, status)
		return
	}

	const code = data.code
	const joinPayload = await joinGameAPI(code)

	gameStore.gameCode = code
	if (joinPayload.error) {
		gameStore.clear()
		sendGameError(joinPayload.error, status)
		return
	}

	gameStore.sessionToken = joinPayload.data.wsToken as string
	window.navigate(`/lobby/${code}`)
}
