import { IApiResponse } from '../../types/api.js'

export async function getFriendsListAPI(): Promise<IApiResponse> {
	try {
		const res = await fetch(`/social/api/social/friends-list/me`, {
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
					errorData.error || errorData.message || 'Fetch friends list failed',
				status: errorData.statusCode || res.status
			}
		}

		const data = await res.json()
		return { data, error: null, status: res.status }
	} catch (error) {
		return { data: null, error: 'Network error', status: 0 }
	}
}

export async function getPendingRequestsAPI(): Promise<IApiResponse> {
	try {
		const res = await fetch(`/social/api/social/pending-requests/me`, {
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
					errorData.error ||
					errorData.message ||
					'Fetch friend requests failed',
				status: errorData.statusCode || res.status
			}
		}
		const data = await res.json()
		return { data, error: null, status: res.status }
	} catch (error) {
		return { data: null, error: 'Network error', status: 0 }
	}
}

export async function checkIsFriendAPI(userId: number): Promise<IApiResponse> {
	try {
		const res = await fetch(`/social/api/social/is-friend/${userId}`, {
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
				error: errorData.error || errorData.message || 'Check is friend failed',
				status: errorData.statusCode || res.status
			}
		}
		const data = await res.json()
		return { data, error: null, status: res.status }
	} catch (error) {
		return { data: null, error: 'Network error', status: 0 }
	}
}
