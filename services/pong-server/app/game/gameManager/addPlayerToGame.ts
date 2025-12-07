import { games, playerToGame } from './gamesData.js'

/*
 * Function to add a second player to a game instance
 * return:
 *  nothing
 * error:
 *  - throw: Error('game full')
 *  - throw: Error('unknow game code')
 *  - throw: Error(player already in a game')
 */
export function addPlayerToGame(gameCode: string, playerId: number) {
	if (!games.has(gameCode)) {
		throw new Error('unknown game code')
	}

	if (playerToGame.has(playerId)) {
		throw new Error('player already in a game')
	}

	const gameData = games.get(gameCode)
	if (!gameData?.p2) {
		gameData!.p2 = playerId
		playerToGame.set(playerId, gameCode)
		return
	}
	throw Error('game full')
}
