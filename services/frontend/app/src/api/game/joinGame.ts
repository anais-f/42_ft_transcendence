import { IApiResponse } from '../../types/api.js'

export interface JoinGameResponse {
	wsToken: string
	expiresIn: number
}

export async function joinGameApi(code: string): Promise<IApiResponse> {
	try {
		const response = await fetch(`/game/api/game/join-game/${code}`, {
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
