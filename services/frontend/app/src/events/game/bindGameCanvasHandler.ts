import { gameStore } from '../../usecases/gameStore.js'
import { gameEngine } from '../../game/core/GameEngine.js'

export function handleBindGameCanvas() {
	gameStore.navigatingToGame = false

	const canvas = document.getElementById('pong') as HTMLCanvasElement | null
	const ws = gameStore.getGameSocket()

	if (canvas && ws) {
		gameEngine.bindAll(canvas, ws)

		ws.onclose = () => {
			console.log('Game WS closed - redirecting to home')
			window.navigate('/home')
		}

		ws.onerror = (error) => {
			console.error('Game WS error:', error)
		}
	}

	console.log('Game canvas bound')
}

export function handleUnbindGameCanvas() {
	gameEngine.unbindAll()
	console.log('Game canvas unbound')
}
