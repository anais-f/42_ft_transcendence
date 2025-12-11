import { games } from '../gameData.js'
import { leaveGame } from './leaveGame.js'

export function startTimeOut(code: string, ms: number = 10000) {
	const gameData = games.get(code)
	if (!gameData) {
		return
	}

	setTimeout(() => {
		if (!gameData.p1.connState || !gameData.p2?.connState) {
			try {
				leaveGame(gameData.p1.id)
			} catch (e) {
				// Someone already left
			}
		}
	}, ms)
}
