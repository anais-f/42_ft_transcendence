import { gameStore } from '../../../usecases/gameStore.js'

export function startHandler(_data: unknown) {
	gameStore.navigatingToGame = true
	window.navigate('/play')
}
