import { gameStore } from '../../../usecases/gameStore.js'
import { currentUser } from '../../../usecases/userStore.js'
import { PlayerSlot } from '../../types.js'

export function slotHandler(data: unknown) {
	const { slot } = data as { slot: PlayerSlot }
	gameStore.playerSlot = slot

	if (currentUser) {
		const playerData = {
			username: currentUser.username,
			avatar: currentUser.avatar
		}
		if (slot === 'p1') {
			gameStore.p1 = playerData
		} else {
			gameStore.p2 = playerData
		}
	}
}
