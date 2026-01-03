import { playerToGame, games } from './gameData.js'
import { leaveGame } from './gameManager/leaveGame.js'
import { quitTournamentByUserId } from './tournamentManager/quitTournament.js'

/**
 * Cleanup user's active games and tournaments
 * Called on logout to remove user from any ongoing activities
 */
export function cleanupUserGamesAndTournaments(userId: number): void {
	// Leave game if user is in one
	const gameCode = playerToGame.get(userId)
	if (gameCode) {
		try {
			// Close and set the leaving user's websocket to null so forfeit logic works correctly
			const gameData = games.get(gameCode)
			if (gameData) {
				if (gameData.p1?.id === userId && gameData.p1.ws) {
					gameData.p1.ws.close()
					gameData.p1.ws = null
				} else if (gameData.p2?.id === userId && gameData.p2.ws) {
					gameData.p2.ws.close()
					gameData.p2.ws = null
				}
			}
			leaveGame(gameCode)
		} catch (e) {
			console.error(`[Cleanup] Error leaving game for user ${userId}:`, e)
		}
	}

	// Quit tournament if user is in one (only if not started)
	try {
		quitTournamentByUserId(userId)
	} catch (e: any) {
		// Ignore expected errors (not in tournament or tournament already started)
		if (e.statusCode !== 404 && e.statusCode !== 409) {
			console.error(
				`[Cleanup] Unexpected error quitting tournament for user ${userId}:`,
				e
			)
		}
	}
}
