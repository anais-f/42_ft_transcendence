import { games, playerToActiveGame } from './gamesData.js'

/*
 * Function to remove a player from their current active game
 * If both players have left, the game is deleted
 * Sets the game status to 'finished' when a player leaves
 * @param playerId - The ID of the player leaving
 * @return nothing
 */
export function leaveGame(playerId: number) {
	const gameCode = playerToActiveGame.get(playerId)
	if (!gameCode) return

	const gameData = games.get(gameCode)
	if (gameData) {
		if (gameData.p1?.id === playerId) gameData.p1 = undefined
		if (gameData.p2?.id === playerId) gameData.p2 = undefined

		gameData.status = 'finished'

		if (!gameData.p1 && !gameData.p2) {
			games.delete(gameCode)
		}
	}
	playerToActiveGame.delete(playerId)
}
