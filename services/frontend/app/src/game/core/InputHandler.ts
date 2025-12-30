import { gameStore } from '../../usecases/gameStore.js'
import { UP_KEYS, DOWN_KEYS } from '../constants.js'
import { C01Move, padDirection } from '@pong-shared/index.js'

const pressedKeys = new Set<string>()

function sendMove(state: boolean, dir: padDirection): void {
	const ws = gameStore.gameSocket
	if (!ws) {
		return
	}

	const packet = new C01Move(state, dir)
	ws.send(packet.serialize())
}

function updateMovement(): void {
	const upPressed = UP_KEYS.some((k) => pressedKeys.has(k))
	const downPressed = DOWN_KEYS.some((k) => pressedKeys.has(k))

	if (upPressed && !downPressed) {
		sendMove(true, padDirection.UP)
	} else if (downPressed && !upPressed) {
		sendMove(true, padDirection.DOWN)
	} else {
		// both pressed or none pressed = stop
		sendMove(false, padDirection.UP)
	}
}

function onKeyDown(e: KeyboardEvent): void {
	if (UP_KEYS.includes(e.key) || DOWN_KEYS.includes(e.key)) {
		if (!pressedKeys.has(e.key)) {
			pressedKeys.add(e.key)
			updateMovement()
		}
	}
}

function onKeyUp(e: KeyboardEvent): void {
	if (pressedKeys.has(e.key)) {
		pressedKeys.delete(e.key)
		updateMovement()
	}
}

export class InputHandler {
	bind(): void {
		window.addEventListener('keydown', onKeyDown)
		window.addEventListener('keyup', onKeyUp)
	}

	unbind(): void {
		window.removeEventListener('keydown', onKeyDown)
		window.removeEventListener('keyup', onKeyUp)
		pressedKeys.clear()
	}
}

export const inputHandler = new InputHandler()
