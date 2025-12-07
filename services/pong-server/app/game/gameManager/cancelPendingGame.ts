import { games, playerToPendingGame } from './gamesData.js'

/*
 * Cancels a pending game and removes it from the system
 * Clears both players from playerToPendingGame
 * return
 *  - nothing
 * error:
 *  - throw: Error('unknown game code')
 *  - throw: Error('game not pending')
 */
export function cancelPendingGame(gameCode: string) {
	const gameData = games.get(gameCode)

	if (!gameData) {
		throw new Error('unknown game code')
	}

	if (gameData.status !== 'pending') {
		throw new Error('game not pending')
	}

	if (gameData.p1) {
		playerToPendingGame.delete(gameData.p1.id)
	}

	if (gameData.p2) {
		playerToPendingGame.delete(gameData.p2.id)
	}

	games.delete(gameCode)
}
