import { playerToGame, games } from './gameData.js'
import { leaveGame } from './gameManager/leaveGame.js'
import { quitTournamentByUserId } from './tournamentManager/quitTournament.js'

export function cleanupUserGamesAndTournaments(userId: number): void {
	const gameCode = playerToGame.get(userId)
	if (gameCode) {
		try {
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
		} catch (e) {}
	}

	try {
		quitTournamentByUserId(userId)
	} catch (e: any) {}
}
