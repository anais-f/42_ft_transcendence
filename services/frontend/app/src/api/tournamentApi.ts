import { IApiResponse } from '../types/api.js'

export async function fetchCreateTournament(): Promise<IApiResponse> {
	try {
		const res = await fetch(`/game/api/game/createTournament`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({ numberOfPlayers: 4 })
		})

		if (!res.ok) {
			const errorData = await res.json()
			return {
				data: null,
				error:
					errorData.error || errorData.message || 'Failed to create tournament',
				status: errorData.statusCode || res.status
			}
		}

		const data = await res.json()
		return { data, error: null, status: res.status }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}

export async function fetchJoinTournament(code: string): Promise<IApiResponse> {
	try {
		const res = await fetch(`/game/api/game/joinTournament/${code}`, {
			method: 'POST',
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
					errorData.error || errorData.message || 'Failed to join tournament',
				status: errorData.statusCode || res.status
			}
		}

		const data = await res.json()
		return { data, error: null, status: res.status }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}

export async function fetchGetTournament(code: string): Promise<IApiResponse> {
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

export async function fetchQuitTournament(code: string): Promise<IApiResponse> {
	try {
		const res = await fetch(`/game/api/game/quitTournament/${code}`, {
			method: 'DELETE',
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
					errorData.error || errorData.message || 'Failed to quit tournament',
				status: errorData.statusCode || res.status
			}
		}

		return { data: null, error: null, status: res.status }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}
