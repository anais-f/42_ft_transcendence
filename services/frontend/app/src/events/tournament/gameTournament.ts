import { joinGameAPI } from '../../api/game/joinGame.js'
import { gameStore } from '../../usecases/gameStore.js'
import { sendGameError } from '../home/errorMapUtils.js'

export async function handleJoinGameTournament(
	code: string
): Promise<{ success: boolean; alreadyInGame: boolean }> {
	const { data, error, status } = await joinGameAPI(code)

	if (error) {
		if (status === 409) {
			gameStore.clear()
			return { success: false, alreadyInGame: true }
		}

		sendGameError(error, status)
		gameStore.clear()
		return { success: false, alreadyInGame: false }
	}

	gameStore.gameCode = code
	gameStore.sessionToken = data.wsToken
	console.log(data.wsToken)
	return { success: true, alreadyInGame: false }
}
