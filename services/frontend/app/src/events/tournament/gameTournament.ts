import { joinGameApi } from '../../api/game/joinGame.js'
import { gameStore } from '../../usecases/gameStore.js'
import { sendGameError } from '../home/errorMapUtils.js'

export async function handleJoinGameTournament(
	code: string
): Promise<{ success: boolean; alreadyInGame: boolean }> {
	const { data, error, status } = await joinGameApi(code)

	if (error) {
		// 409 means the user is already in the game from another tab
		if (status === 409) {
			console.log('Already in game from another tab:', code)
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
