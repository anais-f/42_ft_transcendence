// routes for accept, request, decline, remove friend
import { IApiResponse} from "../../types/api.js";

export async function requestFriendApi(
	userId: number
): Promise<IApiResponse> {
	try {
		const res = await fetch(`/social/api/social/request-friend`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({ user_id: userId })
		})

		if (!res.ok) {
			const errorData = await res.json()
			return {
				data: null,
				error: errorData.error || errorData.message || 'Request friend failed',
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

export async function acceptFriendApi(
	userId: number
): Promise<IApiResponse> {
	try {
		const res = await fetch(`/social/api/social/accept-friend`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({ user_id: userId })
		})

		if (!res.ok) {
			const errorData = await res.json()
			return {
				data: null,
				error: errorData.error || errorData.message || 'Accept friend failed',
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

export async function rejectFriendApi(
	userId: number
): Promise<IApiResponse> {
	try {
		const res = await fetch(`/social/api/social/reject-friend`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({ user_id: userId })
		})

		if (!res.ok) {
			const errorData = await res.json()
			return {
				data: null,
				error: errorData.error || errorData.message || 'Reject friend failed',
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

export async function removeFriendApi(userId: number): Promise<IApiResponse> {
	try {
		const res = await fetch(`/social/api/social/remove-friend`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({ user_id: userId })
		})

		if (!res.ok) {
			const errorData = await res.json()
			return {
				data: null,
				error: errorData.error || errorData.message || 'Remove friend failed',
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
