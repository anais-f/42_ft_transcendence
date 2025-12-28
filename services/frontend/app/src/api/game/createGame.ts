import { IApiResponse } from '../../types/api.js'

export interface NewGameResponse {
	code: string
}

export async function createGameApi(): Promise<IApiResponse> {
	try {
		const response = await fetch('/game/api/game/new-game', {
			method: 'POST',
			credentials: 'include'
		})

		const payload = await response.json()
		if (!response.ok) {
			return {
				data: null,
				error: payload.error || payload.message || 'Request failed',
				status: payload.statusCode || response.status
			}
		}
		return { data: payload, error: null, status: 200 }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}

export function createGameWebSocket(token: string): WebSocket {
	const wsUrl = `wss://${window.location.host}/game/api/game/ws?token=${token}`
	return new WebSocket(wsUrl)
}
