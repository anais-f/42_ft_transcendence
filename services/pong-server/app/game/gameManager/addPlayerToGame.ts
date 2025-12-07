import { games, playerToGame } from './gamesData.js'

/*
 * Function to add a second player to a game instance
 * return:
 *  nothing
 * error:
 *  - throw: Error('game full')
 *  - throw: Error('unknown game code')
 *  - throw: Error('player already in a game')
 */
export function addPlayerToGame(gameCode: string, playerId: number) {
	const gameData = games.get(gameCode)

	if (!gameData) {
		throw new Error('unknown game code')
	}

	if (playerToGame.has(playerId)) {
		throw new Error('player already in a game')
	}

	if (!gameData.p2) {
		gameData.p2 = { id: playerId, connState: false }
		playerToGame.set(playerId, gameCode)
		return
	}

	throw new Error('game full')
}
