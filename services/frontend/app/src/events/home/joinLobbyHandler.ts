import { gameStore } from '../../usecases/gameStore.js'
import { joinGame } from '../../api/game/joinGame.js'

export async function handleJoinLobby(code: string) {
	gameStore.gameCode = code

	const token = await joinGame(code)
	if (!token) {
		console.error('Failed to join game')
		gameStore.clear()
		return
	}
	gameStore.sessionToken = token
	window.navigate(`/lobby/${code}`)
}
