import { randomString } from 'node_modules/zod/v4/core/util.cjs'
import { games } from './gamesData.js'

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
 *
 */
export function requestGame(request: {
	code: string | null
	pID: number
}): string {
	const { code, pID } = request

	if (null == code) {
		const newCode = generateCode()

		games.set(newCode, {
			p1: pID,
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
