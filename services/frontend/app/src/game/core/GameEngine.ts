import { renderer } from './Renderer.js'
import { inputHandler } from './InputHandler.js'
import { cleanupNetworkDispatcher } from '../network/dispatcher.js'
import { gameStore } from '../../usecases/gameStore.js'

export class GameEngine {
	private ws: WebSocket | null = null

	bindAll(canvas: HTMLCanvasElement, ws: WebSocket): void {
		this.ws = ws

		renderer.setCanvas(canvas)

		inputHandler.bind()
	}

	unbindAll(): void {
		inputHandler.unbind()

		renderer.clear()

		// Sauvegarder backTo avant de clear pour que le onclose handler puisse l'utiliser
		const savedBackTo = gameStore.backTo

		if (this.ws) {
			cleanupNetworkDispatcher(this.ws)
			this.ws.close()
			this.ws = null
		}

		gameStore.clear()
		gameStore.backTo = savedBackTo
	}
}

export const gameEngine = new GameEngine()
