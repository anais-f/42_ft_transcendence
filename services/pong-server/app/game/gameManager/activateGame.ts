import { games, playerToActiveGame, playerToPendingGame } from './gamesData.js'

/*
 * Transitions a game from 'pending' to 'active' status
 * Moves players from playerToPendingGame to playerToActiveGame
 * return
 * 	- nothing
 * error:
 *  - throw: Error('unknown game code')
 *  - throw: Error('game not pending')
 */
export function activateGame(gameCode: string) {
	const gameData = games.get(gameCode)

	if (!gameData) {
		throw new Error('unknown game code')
	}

	if (gameData.status !== 'pending') {
		throw new Error('game not pending')
	}

	gameData.status = 'active'

	if (gameData.p1) {
		playerToPendingGame.delete(gameData.p1.id)
		playerToActiveGame.set(gameData.p1.id, gameCode)
	}

	if (gameData.p2) {
		playerToPendingGame.delete(gameData.p2.id)
		playerToActiveGame.set(gameData.p2.id, gameCode)
	}
}
