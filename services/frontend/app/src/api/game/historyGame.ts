import { IApiResponse } from '../types/api.js'

export async function fetchMatchHistory(userId: number): Promise<IApiResponse> {
	try {
		const res = await fetch(`/game/user/matchHistory/${userId}`, {
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
				error: errorData.error || errorData.message || 'Failed to fetch match history',
				status: errorData.statusCode || res.status
			}
		}

		const data = await res.json()
		return { data, error: null, status: res.status }
	}
	catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}
