import { randomString } from 'node_modules/zod/v4/core/util.cjs'
import { IGameData } from '../utils/createGame'

export const games = new Map<
	string,
	{
		p1: undefined | number
		p2: undefined | number
		gameInstance: IGameData | undefined
	}
>()

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
 * TODO: verify pID
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

/*
 * Function to add a second player to a game instance
 * return:
 *  nothing
 * error:
 *  - throw: Error('game full')
 */
export function addPlayerToGame(gameCode: string, playerId: number) {
	if (!games.has(gameCode)) {
		throw new Error('unknown game code')
	}

	// Know bug here: !gameData.p2 but gameData can be null
	const gameData = games.get(gameCode)
	if (gameData?.p2) {
		gameData.p2 = playerId
	}
	throw Error('game full')
}



/*
 * TODO:
 *  join multiple game protection
 *  create + join another game (what append to the previous game)
 */
