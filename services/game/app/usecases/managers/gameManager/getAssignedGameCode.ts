import { games, playerToGame } from '../gameData.js'

export function getAssignedGameCode(pID: number): string {
	const gameCode = playerToGame.get(pID)
	if (!gameCode) {
		throw new Error('no game assigned')
	}

	const gameData = games.get(gameCode)
	if (!gameData) {
		throw new Error('no game assigned')
	}

	return gameCode
}
