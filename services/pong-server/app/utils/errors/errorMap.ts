export const gameErrorMap: Record<string, number> = {
	'unknown game code': 404,
	'game full': 409,
	'player already in a game': 409,
	'player already has a pending game': 409,
	'game not pending': 400,
	'unknown player': 404
}
