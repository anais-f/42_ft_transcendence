import { gameStore } from '../../usecases/gameStore.js'
import { createGameApi, MapOptions } from '../../api/game/createGame.js'
import { joinGameApi } from '../../api/game/joinGame.js'
import { sendGameError } from './errorMapUtils.js'

export async function handleCreateGame(mapOptions?: MapOptions) {
	const { data, error, status } = await createGameApi(mapOptions)

	if (error) {
		sendGameError(error, status)
		return
	}

	const code = data.code
	const joinPayload = await joinGameApi(code)

	gameStore.gameCode = code
	if (joinPayload.error) {
		gameStore.clear()
		sendGameError(joinPayload.error, status)
		return
	}

	gameStore.sessionToken = joinPayload.data.wsToken as string
	window.navigate(`/lobby/${code}`)
}
