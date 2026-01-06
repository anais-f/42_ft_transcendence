import WebSocket from 'ws'
import { wsConnections } from './connectionManager.js'

const HEARTBEAT_INTERVAL_MS = 30000
const PONG_TIMEOUT_MS = 60000
let heartbeatInterval: NodeJS.Timeout | null = null

export function handlePong(userId: number): void {
	const conn = wsConnections.get(userId)
	if (conn) {
		conn.lastHeartbeat = new Date()
	}
}

export function startHeartbeat(): void {
	if (heartbeatInterval) return

	heartbeatInterval = setInterval(() => {
		const now = Date.now()

		for (const [userId, conn] of wsConnections.entries()) {
			try {
				if (conn.ws.readyState === WebSocket.OPEN) {
					conn.ws.ping()
					const timeSinceLastPong = now - conn.lastHeartbeat.getTime()
					if (timeSinceLastPong > PONG_TIMEOUT_MS) {
						conn.ws.terminate()
					}
				}
			} catch (e) {
				const message = e instanceof Error ? e.message : String(e)
			}
		}
	}, HEARTBEAT_INTERVAL_MS) as NodeJS.Timeout
}

export function stopHeartbeat(): void {
	if (heartbeatInterval) {
		clearInterval(heartbeatInterval)
		heartbeatInterval = null
	}
}
