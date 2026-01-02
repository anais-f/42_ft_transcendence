import { joinGameApi } from '../../api/game/joinGame.js'
import { gameStore } from '../../usecases/gameStore.js'
import { sendGameError } from '../home/errorMapUtils.js'

export async function handleJoinGameTournament(code: string) {
	const { data, error, status } = await joinGameApi(code)

	gameStore.gameCode = code
	if (error) {
		sendGameError(error, status)
		gameStore.clear()
		return
	}

	gameStore.sessionToken = data.wsToken
	console.log(data.wsToken)
	// window.navigate(`/play`)
}
