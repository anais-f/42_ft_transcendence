import { IApiResponse } from '../../types/api.js'
import { PaddleShape, ObstacleType } from '@ft_transcendence/pong-shared'

export interface MapOptions {
	paddleShape?: PaddleShape
	obstacle?: ObstacleType
}

export interface NewGameResponse {
	code: string
}

export async function createGameApi(
	mapOptions?: MapOptions
): Promise<IApiResponse> {
	try {
		const response = await fetch('/game/api/game/new-game', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(mapOptions ? { mapOptions } : {})
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
	const wsUrl = `ws://${window.location.host}/game/api/game/ws?token=${token}`
	return new WebSocket(wsUrl)
}
