import { games } from '../gameData.js'
import { leaveGame } from './leaveGame.js'

export function startTimeOut(code: string, ms: number = 10000) {
	const gameData = games.get(code)
	if (!gameData) {
		return
	}

	setTimeout(() => {
		if (!gameData.p1.ws || !gameData.p2?.ws) {
			console.log(`time out reached for game ${code}`)
			leaveGame(code)
		}
	}, ms)
}
