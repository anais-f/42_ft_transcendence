import { gameStore } from '../../usecases/gameStore.js'
import { createGame } from '../../api/game/createGame.js'
import { joinGame } from '../../api/game/joinGame.js'

export async function handleCreateGame() {
	const code = await createGame()
	if (!code) {
		console.error('Failed to create game')
		return
	}
	gameStore.setGameCode(code)

	const token = await joinGame(code)
	if (!token) {
		console.error('Failed to join game')
		gameStore.clear()
		return
	}
	gameStore.setSessionToken(token)
	window.navigate(`/lobby/${code}`)
}
