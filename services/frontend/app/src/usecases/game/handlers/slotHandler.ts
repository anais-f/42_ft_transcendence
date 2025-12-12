import { gameStore, PlayerSlot } from '../../gameStore.js'
import { currentUser } from '../../userStore.js'

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
