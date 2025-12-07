import { randomString } from 'node_modules/zod/v4/core/util.cjs'
import { games, playerToGame } from './gamesData.js'

/*
 * Function to generate a random game code in the format XXXX-XXXX
 */
function generateCode(): string {
	let newCode: string

	do {
		newCode = `${randomString(4)}-${randomString(4)}`.toUpperCase()
	} while (games.has(newCode))
	return newCode
}

/*
 * Request for a game / new game
 * request:
 *  code (code of a specific game)
 *  pID (player id)
 * return:
 *  game code
 * error:
 *  - throw: Error('unknown game code')
 *  - throw: Error('unauthorized')
 *  - throw: Error('player already in a game')
 *
 */
export function requestGame(request: {
	code: string | null
	pID: number
}): string {
	const { code, pID } = request

	if (playerToGame.has(pID)) {
		throw new Error('player already in a game')
	}
	if (null == code) {
		const newCode = generateCode()

		playerToGame.set(pID, newCode)
		games.set(newCode, {
			p1: { id: pID, connState: false },
			p2: undefined,
			gameInstance: undefined
		})
		return newCode
	}

	if (!games.has(code)) {
		throw new Error('unknown game code')
	}

	return code
}

/*
 * Request for a game with 2 player id
 * request:
 *  pID1: player id of player 1
 *  pID2: player id of player 2
 * return:
 *  gamecode
 * error:
 *  - throw: Error('unknown player')
 *  - throw: Error('player already in a game')
 */
export function requestMatchGame(request: {
	pID1: number
	pID2: number
}): string {
	const { pID1, pID2 } = request

	// i assume player can be assign to a game even if hes already playing
	/*
	if (playerToGame.has(pID1)) {
		throw new Error('player already in a game')
	}
	if (playerToGame.has(pID2)) {
		throw new Error('player already in a game')
	}
	*/

	// TODO: verify that players exist in database

	const newCode = generateCode()

	games.set(newCode, {
		p1: { id: pID1, connState: false },
		p2: { id: pID2, connState: false },
		gameInstance: undefined
	})

	playerToGame.set(pID1, newCode)
	playerToGame.set(pID2, newCode)

	return newCode
}
