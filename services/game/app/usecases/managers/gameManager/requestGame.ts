import { createInviteCode } from '../../../utils/createCode.js'
import { games, playerToGame } from '../gameData.js'
import { startTimeOut } from './startTimeOut.js'
import { ITournamentMatchData } from '../gameData.js'
import { updateGameMetrics } from '../metricsService.js'

/*
 * Creates a new game and returns the game code.
 * param:
 *  pID1 (player id of player 1)
 *  pID2? (player id of player 2)
 *  tournamentMatchData? (optional tournament match information)
 * return:
 *  game code
 * error:
 * 	- throw 'a player is already in a game'
 */

export function requestGame(
	pID1: number,
	pID2: number | undefined = undefined,
	tournamentMatchData: ITournamentMatchData | undefined = undefined
): string {
	if (playerToGame.has(pID1) || (pID2 && playerToGame.has(pID2))) {
		throw new Error('a player is already in a game')
	}

	const newCode = createInviteCode('G')
	games.set(newCode, {
		p1: { id: pID1, ws: null },
		p2: pID2 ? { id: pID2, ws: null } : undefined,
		gameInstance: undefined,
		status: 'waiting',
		createdAt: Date.now(),
		timeoutId: null,
		tournamentMatchData
	})

	playerToGame.set(pID1, newCode)
	if (pID2) {
		// locked game
		playerToGame.set(pID2, newCode)
		try {
			startTimeOut(newCode, 20000)
		} catch (_) {
			// This can happen with normal use
		}
	}

	updateGameMetrics()

	return newCode
}
