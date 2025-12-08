import { games, playerToActiveGame, playerToPendingGame } from './gamesData.js'

/*
 * Function to generate a random game code in the format XXXX-XXXX
 */
function generateCode(): string {
	let code: string
	do {
		const uuid = crypto.randomUUID().replace(/-/g, '').toUpperCase()
		code = `${uuid.slice(0, 4)}-${uuid.slice(4, 8)}`
	} while (games.has(code))
	return code
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
 *  - throw: Error('player already in a game')
 */
export function requestGame(request: {
	code: string | null
	pID: number
}): string {
	const { code, pID } = request

	if (playerToActiveGame.has(pID)) {
		throw new Error('player already in a game')
	}

	if (null == code) {
		const newCode = generateCode()

		playerToActiveGame.set(pID, newCode)
		games.set(newCode, {
			p1: { id: pID, connState: false },
			p2: undefined,
			gameInstance: undefined,
			status: 'active'
		})
		return newCode
	}

	if (!games.has(code)) {
		throw new Error('unknown game code')
	}

	return code
}

/*
 * Request for a pending game with 2 player ids (e.g., tournament match)
 * request:
 *  pID1: player id of player 1
 *  pID2: player id of player 2
 * return:
 *  game code
 * error:
 *  - throw: Error('player already has a pending game')
 *  - throw: Error('unknown player') (TODO)
 */
export function requestPendingGame(request: {
	pID1: number
	pID2: number
}): string {
	const { pID1, pID2 } = request

	if (playerToPendingGame.has(pID1) || playerToPendingGame.has(pID2)) {
		throw new Error('player already has a pending game')
	}

	// TODO: verify that players exist in database

	const newCode = generateCode()

	games.set(newCode, {
		p1: { id: pID1, connState: false },
		p2: { id: pID2, connState: false },
		gameInstance: undefined,
		status: 'pending'
	})

	playerToPendingGame.set(pID1, newCode)
	playerToPendingGame.set(pID2, newCode)

	return newCode
}
