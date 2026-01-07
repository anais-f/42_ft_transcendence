import { IApiResponse } from '../types/api.js'

export async function createTournamentAPI(): Promise<IApiResponse> {
	try {
		const response = await fetch(`/game/api/game/createTournament`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({ numberOfPlayers: 4 })
		})

		const payload = await response.json()
		if (!response.ok) {
			return {
				data: null,
				error:
					payload.error || payload.message || 'Failed to create tournament',
				status: payload.statusCode || response.status
			}
		}

		return { data: payload, error: null, status: response.status }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}

export async function joinTournamentAPI(code: string): Promise<IApiResponse> {
	try {
		const response = await fetch(`/game/api/game/joinTournament/${code}`, {
			method: 'POST',
			credentials: 'include'
		})

		const payload = await response.json()
		if (!response.ok) {
			return {
				data: null,
				error: payload.error || payload.message || 'Failed to join tournament',
				status: payload.statusCode || response.status
			}
		}

		return { data: payload, error: null, status: response.status }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}

export async function getTournamentAPI(code: string): Promise<IApiResponse> {
	try {
		const res = await fetch(`/game/api/game/tournament/${code}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		})

		if (!res.ok) {
			const errorData = await res.json()
			return {
				data: null,
				error:
					errorData.error || errorData.message || 'Failed to get tournament',
				status: errorData.statusCode || res.status
			}
		}

		const data = await res.json()
		return { data, error: null, status: res.status }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}

export async function quitTournamentAPI(): Promise<IApiResponse> {
	try {
		const res = await fetch(`/game/api/game/quitTournament`, {
			method: 'DELETE',
			credentials: 'include',
			keepalive: true
		})

		if (!res.ok) {
			const errorData = await res.json()
			return {
				data: null,
				error:
					errorData.error || errorData.message || 'Failed to quit tournament',
				status: errorData.statusCode || res.status
			}
		}

		return { data: null, error: null, status: res.status }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}
