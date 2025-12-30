export const gameErrorMap: Record<string, number> = {
	'a player is already in a game': 409,
	'player is already in a game': 409,
	'unknown game code': 404,
	'player not allowed in this game': 403,
	'game not found': 404,
	'no game assigned': 404
}
