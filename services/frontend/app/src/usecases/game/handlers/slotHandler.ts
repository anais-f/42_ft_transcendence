import { gameStore, PlayerSlot } from '../../gameStore.js'

export function slotHandler(data: unknown) {
	const { slot } = data as { slot: PlayerSlot }
	gameStore.playerSlot = slot
}
