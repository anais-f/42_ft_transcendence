import { gameStore } from '../../usecases/gameStore.js'
import { notyfGlobal as notyf } from '../../utils/notyf.js'
import { createGameApi } from '../../api/game/createGame.js'
import { joinGameApi } from '../../api/game/joinGame.js'

/*
export async function handleCreateGame() {
	const code = await createGameApi()
	if (!code) {
		console.error('Failed to create game')
		return
	}
	gameStore.gameCode = code

	const token = await joinGameApi(code)
	if (!token) {
		console.error('Failed to join game')
		gameStore.clear()
		return
	}
	gameStore.sessionToken = token
	window.navigate(`/lobby/${code}`)
}
*/

export async function handleCreateGame() {
	const { data, error, status } = await createGameApi()

	if (error) {
		notyf.error('TODOOOOOOOO')
		return
	}

	const code = data.code
	const joinPayload = await joinGameApi(code)

	gameStore.gameCode = code
	if (joinPayload.error) {
		notyf.error('TODOOOOOOOO')
		gameStore.clear()
		return
	}

	gameStore.sessionToken = (joinPayload.data.wsToken as string)
	window.navigate(`/lobby/${code}`)
}
