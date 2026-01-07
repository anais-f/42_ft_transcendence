import { userByIdAPI } from '../../../api/usersApi.js'
import { gameStore } from '../../../usecases/gameStore.js'

export async function opponentHandler(data: unknown) {
	const { id } = data as { id: number }
	const opponent = await userByIdAPI(id)
	if (opponent.error || !opponent.data) {
		return
	}

	const opponentData = {
		username: opponent.data.username,
		avatar: opponent.data.avatar
	}
	if (gameStore.playerSlot === 'p1') {
		gameStore.p2 = opponentData
	} else {
		gameStore.p1 = opponentData
	}

	gameStore.notifyOpponentJoined(opponentData)
}
