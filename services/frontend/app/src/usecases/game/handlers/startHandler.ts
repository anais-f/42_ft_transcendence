import { gameStore } from '../../gameStore.js'

export function startHandler(_data: unknown) {
	gameStore.navigatingToGame = true
	window.navigate('/game')
}
