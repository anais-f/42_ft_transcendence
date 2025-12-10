import { leaveGame } from './leaveGame.js'

export function startTimeOut(pID: number, ms: number = 10000) {
	setTimeout(() => {
		leaveGame(pID)
	}, ms)
}
