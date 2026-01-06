import { games, tournaments } from '../usecases/managers/gameData.js'

type codeID = 'T' | 'G'
const localMap: Record<codeID, Map<string, any>> = {
	'T': tournaments,
	'G': games
}

export function createInviteCode(type: 'T' | 'G'): string {
	let code: string = ''

	do {
		code = `${type}-${randomAlphaNumeric(5)}`
	} while (localMap[type].has(code))

	return code
}

function randomAlphaNumeric(length: number): string {
	let code: string
	const uuid = crypto
		.randomUUID()
		.replace(/[\-0o]/g, '')
		.toUpperCase()
	code = uuid.slice(0, length)
	return code
}
