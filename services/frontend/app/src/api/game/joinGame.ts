import { IApiResponse } from '../../types/api.js'

export interface JoinGameResponse {
	wsToken: string
	expiresIn: number
}

export interface AssignedGameResponse {
	code: string
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
				error: payload.error || payload.message || 'Failed to join game',
				status: payload.statusCode || response.status
			}
		}
		return { data: payload, error: null, status: 200 }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}

export async function getAssignedGameApi(): Promise<IApiResponse> {
	try {
		const response = await fetch('/game/api/game/assigned', {
			method: 'GET',
			credentials: 'include'
		})

		if (response.status === 404) {
			return { data: null, error: null, status: 404 }
		}

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
