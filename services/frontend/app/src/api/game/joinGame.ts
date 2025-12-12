export interface JoinGameResponse {
	wsToken: string
	expiresIn: number
}

export async function joinGame(code: string): Promise<string | null> {
	try {
		const response = await fetch(`/game/api/game/join-game/${code}`, {
			method: 'POST',
			credentials: 'include'
		})

		if (!response.ok) {
			const status = response.status
			if (status === 404) {
				console.error('Unknown game code')
			} else if (status === 409) {
				console.error('Player already in a game or not allowed')
			}
			return null
		}

		const data = (await response.json()) as JoinGameResponse
		return data.wsToken
	} catch (error) {
		console.error('Join game failed:', error)
		return null
	}
}
