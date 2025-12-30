import { joinGameApi } from '../../api/game/joinGame.js'
import { gameStore } from '../../usecases/gameStore.js'
import { sendGameError } from './errorMapUtils.js'

export async function handleJoinLobby(e: Event) {
	e.preventDefault()
	const input = document.getElementById('join_lobby') as HTMLInputElement
	const code = input?.value?.trim().toUpperCase()

	const { data, error, status } = await joinGameApi(code)

	gameStore.gameCode = code
	if (error) {
		sendGameError(error, status)
		gameStore.clear()
		return
	}

	gameStore.sessionToken = data.wsToken
	window.navigate(`/lobby/${code}`)
}
