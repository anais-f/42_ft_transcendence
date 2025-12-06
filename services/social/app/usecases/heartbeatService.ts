import WebSocket from 'ws'
import { wsConnections } from './connectionManager.js'

const HEARTBEAT_INTERVAL_MS = 30000
const PONG_TIMEOUT_MS = 60000
let heartbeatInterval: NodeJS.Timeout | null = null

/**
 * Handle pong response from client
 * @param userId - User ID
 */
export function handlePong(userId: number): void {
	const conn = wsConnections.get(userId)
	if (conn) {
		conn.lastHeartbeat = new Date()
	}
}

/**
 * Start heartbeat interval (ping every 30s)
 * If a client does not respond with pong within timeout, connection is terminated
 */
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
						console.warn(
							`User ${userId} not responding to heartbeat (${timeSinceLastPong}ms), terminating connection`
						)
						conn.ws.terminate()
					}
				}
			} catch (e) {
				const message = e instanceof Error ? e.message : String(e)
				console.warn(`Heartbeat failed for user ${userId}:`, message)
			}
		}
	}, HEARTBEAT_INTERVAL_MS) as NodeJS.Timeout
}

/**
 * Stop heartbeat interval
 */
export function stopHeartbeat(): void {
	if (heartbeatInterval) {
		clearInterval(heartbeatInterval)
		heartbeatInterval = null
	}
}
