import { GameData } from '../managers/gameData.js'
import { startGame } from './startGame.js'

// lobby count down
export function startCountdown(gameData: GameData) {
	const COUNTDOWN_SECONDS = 5

	let remaining = COUNTDOWN_SECONDS

	const interval = setInterval(() => {
		// failsafe
		if (!gameData.p1.ws || !gameData.p2?.ws) {
			clearInterval(interval)
			return
		}

		const message = JSON.stringify({
			type: 'startingIn',
			data: { seconds: remaining }
		})
		gameData.p1.ws.send(message)
		gameData.p2.ws.send(message)

		--remaining

		if (remaining < 0) {
			clearInterval(interval)
			const startMessage = JSON.stringify({ type: 'start' })
			gameData.p1.ws.send(startMessage)
			gameData.p2.ws.send(startMessage)
			gameData.status = 'active'
			startGame(gameData)
		}
	}, 1000)
}
