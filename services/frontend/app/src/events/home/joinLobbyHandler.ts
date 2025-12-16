import { joinGameApi } from '../../api/game/joinGame.js'
import { gameStore } from '../../usecases/gameStore.js'
import { notyfGlobal as notyf } from '../../utils/notyf.js'

export async function handleJoinLobby(e: Event) {

	e.preventDefault()
	const input = document.getElementById('join_lobby') as HTMLInputElement
	const code = input?.value?.trim()


	const { data, error, status } = await joinGameApi(code)

	gameStore.gameCode = code
	if (error) {
		gameStore.clear()
		notyf.error(`TODOOOOOOO: ${status}`)
	}

	gameStore.sessionToken = data.wsToken
	window.navigate(`/lobby/${code}`)
}
