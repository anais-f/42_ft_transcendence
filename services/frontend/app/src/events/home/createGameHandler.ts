import { gameStore } from '../../usecases/gameStore.js'
import { notyfGlobal as notyf } from '../../utils/notyf.js'
import { createGameApi } from '../../api/game/createGame.js'
import { joinGameApi } from '../../api/game/joinGame.js'

export async function handleCreateGame() {
	const { data, error, status } = await createGameApi()

	if (error) {
		notyf.error(error)
		return
	}

	const code = data.code
	const joinPayload = await joinGameApi(code)

	gameStore.gameCode = code
	if (joinPayload.error) {
		gameStore.clear()

		if (status === 400) {
			notyf.error('Invalid game code!')
		} else {
			notyf.error(joinPayload.error)
		}
		return
	}

	gameStore.sessionToken = joinPayload.data.wsToken as string
	window.navigate(`/lobby/${code}`)
}
