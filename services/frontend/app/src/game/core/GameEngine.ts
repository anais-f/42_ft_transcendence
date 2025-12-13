import { renderer } from './Renderer.js'
import { inputHandler } from './InputHandler.js'
import {
	setupNetworkDispatcher,
	cleanupNetworkDispatcher
} from '../network/dispatcher.js'
import { gameStore } from '../../usecases/gameStore.js'

export class GameEngine {
	private ws: WebSocket | null = null

	bindAll(canvas: HTMLCanvasElement, ws: WebSocket): void {
		this.ws = ws

		renderer.setCanvas(canvas)

		inputHandler.bind()

		setupNetworkDispatcher(ws)
	}

	unbindAll(): void {
		inputHandler.unbind()

		renderer.clear()

		cleanupNetworkDispatcher()

		if (this.ws) {
			this.ws.close()
			this.ws = null
		}

		gameStore.clear()
	}
}

export const gameEngine = new GameEngine()
