import { games } from '../../gameData.js'
import { leaveGame } from './leaveGame.js'

export function startTimeOut(code: string, ms: number = 10000) {
	const gameData = games.get(code)
	if (!gameData) {
		return
	}

	if (gameData.timeoutId) {
		clearTimeout(gameData.timeoutId)
	}

	gameData.timeoutId = setTimeout(() => {
		gameData.timeoutId = null
		if (
			gameData.status === 'waiting' &&
			(!gameData.p1.ws || !gameData.p2?.ws)
		) {
			leaveGame(code)
		}
	}, ms)
}

export function clearGameTimeout(code: string) {
	const gameData = games.get(code)
	if (gameData?.timeoutId) {
		clearTimeout(gameData.timeoutId)
		gameData.timeoutId = null
	}
}
