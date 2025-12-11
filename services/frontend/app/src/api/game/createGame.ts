
export interface NewGameResponse {
	code: string
}

export async function createGame(): Promise<string | null> {
	try {
		const response = await fetch('/game/api/game/new-game', {
			method: 'POST',
			credentials: 'include'
		})

		if (!response.ok) {
			const status = response.status
			if (status === 409) {
				console.error('Player already in a game')
			}
			return null
		}

		const data = (await response.json()) as NewGameResponse
		return data.code
	} catch (error) {
		console.error('Create game failed:', error)
		return null
	}
}

export function createGameWebSocket(token: string): WebSocket {
	const wsUrl = `ws://${window.location.host}/game/api/game/ws?token=${token}`
	return new WebSocket(wsUrl)
}
