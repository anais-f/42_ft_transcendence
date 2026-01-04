import { GameWSCloseCodes } from '@ft_transcendence/pong-shared'
import { gameStore } from '../../usecases/gameStore.js'
import { gameEngine } from '../../game/core/GameEngine.js'
import { C02RequestScore } from '@pong-shared/index.js'
import { notyfGlobal as notfy } from '../../utils/notyf.js'

export function handleBindGameCanvas() {
	gameStore.navigatingToGame = false

	const canvas = document.getElementById('pong') as HTMLCanvasElement | null
	const ws = gameStore.gameSocket

	if (!ws) {
		console.log('No game WebSocket - redirecting to home')
		window.navigate('/')
		return
	}

	if (canvas) {
		gameEngine.bindAll(canvas, ws)

		const requestScore = new C02RequestScore()
		ws.send(requestScore.serialize())

		ws.onclose = (event) => {
			console.log(`Game WS closed (code: ${event.code})`)
			if (event.code !== GameWSCloseCodes.NORMAL) {
				notfy.open({ type: 'info', message: 'You left the game' })
			}
			window.navigate(gameStore.backTo)
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
