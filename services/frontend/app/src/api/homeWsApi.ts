import { IApiResponse } from '../types/api.js'

export async function createSocialTokenApi(): Promise<IApiResponse> {
	try {
		const response = await fetch('/social/api/social/create-token', {
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
		return { data: payload, error: null, status: 201 }
	} catch {
		return { data: null, error: 'Network error', status: 0 }
	}
}

export function createSocialWebSocketApi(token: string): WebSocket {
	const wsUrl = `ws://${window.location.host}/social/api/social/ws?token=${token}`
	return new WebSocket(wsUrl)
}
