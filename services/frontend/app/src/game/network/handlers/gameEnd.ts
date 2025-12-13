import { gameStore } from '../../../usecases/gameStore.js'

export function eogHandler(data: unknown) {
	const { reason } = data as { reason: string }
	console.log('Game ended:', reason)

	const ws = gameStore.gameSocket
	if (ws) {
		ws.close()
		gameStore.gameSocket = null
	}
}
