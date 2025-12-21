import { IApiResponse } from "../../types/api.js";

export async function getFriendsListApi(): Promise<IApiResponse> {
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
				error: errorData.error || errorData.message || 'Fetch friends list failed',
				status: errorData.statusCode || res.status
			}
		}

		const data = await res.json()
		return { data, error: null, status: res.status }
	}
	catch (error) {
		return { data: null, error: 'Network error', status: 0 }
	}
}

export async function getPendingRequestsApi(): Promise<IApiResponse> {
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
				error: errorData.error || errorData.message || 'Fetch friend requests failed',
				status: errorData.statusCode || res.status
			}
		}
		const data = await res.json()
		return { data, error: null, status: res.status }
	}
	catch (error) {
		return { data: null, error: 'Network error', status: 0 }
	}
}