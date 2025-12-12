import { C01Move } from '@ft_transcendence/pong-shared/network/Packet/Client/C01.js'
import { padDirection } from '@ft_transcendence/pong-shared/engine/PongPad.js'
import { gameStore } from '../gameStore.js'

const UP_KEYS = ['w', 'W', 'k', 'K', 'ArrowUp']
const DOWN_KEYS = ['s', 'S', 'J', 'j', 'ArrowDown']

const pressedKeys = new Set<string>()

function sendMove(state: boolean, dir: padDirection): void {
	const ws = gameStore.getGameSocket()
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

export function bindInputHandler(): void {
	window.addEventListener('keydown', onKeyDown)
	window.addEventListener('keyup', onKeyUp)
}

export function unbindInputHandler(): void {
	window.removeEventListener('keydown', onKeyDown)
	window.removeEventListener('keyup', onKeyUp)
	pressedKeys.clear()
}
