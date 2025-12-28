import { IApiResponse } from '../../types/api.js'

export interface NewGameResponse {
	code: string
}

export async function createGameApi(): Promise<IApiResponse> {
	try {
		const response = await fetch('/game/api/game/new-game', {
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

export function tryGameWebSocket(token: string): WebSocket {
	const wsUrl = `wss://${window.location.host}/game/api/game/ws?token=${token}`
	return new WebSocket(wsUrl)
}

const WS_MAX_RETRIES = 5
const WS_TIMEOUT_MS = 3000
const WS_BASE_DELAY_MS = 300

export async function createGameWebSocket(token: string): Promise<WebSocket> {
	let attempt = 0

	do {
		attempt++
		console.log(`try WS: ${attempt}`)
		const ws = tryGameWebSocket(token)

		const connected = await new Promise<boolean>((resolve) => {
			const timeout = setTimeout(() => {
				ws.close()
				resolve(false)
			}, WS_TIMEOUT_MS)

			ws.onopen = () => {
				clearTimeout(timeout)
				resolve(true)
			}

			ws.onerror = () => {
				clearTimeout(timeout)
				resolve(false)
			}
		})

		if (connected) {
			return ws
		}

		if (attempt < WS_MAX_RETRIES) {
			const delay = WS_BASE_DELAY_MS * Math.pow(2, attempt - 1)
			console.log(`WS retry ${attempt}/${WS_MAX_RETRIES} in ${delay}ms`)
			await new Promise((r) => setTimeout(r, delay))
		}
	} while (attempt < WS_MAX_RETRIES)

	throw new Error('WebSocket connection failed after max retries')
}
