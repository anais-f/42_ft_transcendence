import { gameStore } from '../../gameStore.js'

export function eogHandler(data: unknown) {
	const { reason } = data as { reason: string }
	console.log('Game ended:', reason)

	const ws = gameStore.getGameSocket()
	if (ws) {
		ws.close()
		gameStore.setGameSocket(null)
	}

	window.navigate('/home')
}
