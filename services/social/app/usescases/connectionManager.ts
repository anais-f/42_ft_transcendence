import WebSocket from 'ws'

interface UserConnection {
	ws: WebSocket
	lastHeartbeat: Date
}

export const wsConnections = new Map<string, UserConnection>()
const pendingDisconnectTimers = new Map<string, NodeJS.Timeout>()
const DISCONNECT_DELAY_MS = 5000
const HEARTBEAT_INTERVAL_MS = 30000
const PONG_TIMEOUT_MS = 60000
let heartbeatInterval: NodeJS.Timeout | null = null

/**
 * Setup event handlers for a WebSocket connection
 */
function setupWebSocketHandlers(userId: string, ws: WebSocket): void {
	ws.on('pong', () => {
		const conn = wsConnections.get(userId)
		if (conn) {
			conn.lastHeartbeat = new Date()
		}
	})

	ws.on('close', () => {
		removeConnection(userId, ws)
	})

	ws.on('error', (err: Error) => {
		console.error(`WebSocket error for user ${userId}:`, err.message)
		removeConnection(userId, ws)
	})
}

/**
 * Start heartbeat interval (enverra un ping toutes les 30s)
 */
function startHeartbeat(): void {
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
						removeConnection(userId, conn.ws)
					}
				}
			} catch (e) {
				const message = e instanceof Error ? e.message : String(e)
				console.warn(`Heartbeat failed for user ${userId}:`, message)
				try {
					removeConnection(userId, conn.ws)
				} catch (cleanupErr) {}
			}
		}
	}, HEARTBEAT_INTERVAL_MS) as NodeJS.Timeout

	console.log('Heartbeat started')
}

/**
 * Stop heartbeat interval
 */
function stopHeartbeat(): void {
	if (heartbeatInterval) {
		clearInterval(heartbeatInterval)
		heartbeatInterval = null
		console.log('Heartbeat stopped')
	}
}

/**
 * Cancel pending disconnect timer for a user
 */
function cancelPendingDisconnect(userId: string): void {
	const timer = pendingDisconnectTimers.get(userId)
	if (timer) {
		clearTimeout(timer)
		pendingDisconnectTimers.delete(userId)
		console.log(`Cancelled pending disconnect for user ${userId}`)
	}
}

/**
 * Notify users service about status change
 */
async function notifyStatusChange(
	userId: string,
	status: 'online' | 'offline'
): Promise<void> {
	const base = process.env.USERS_SERVICE_URL
	const secret = process.env.USERS_API_SECRET
	if (!base || !secret) {
		console.error('Missing USERS_SERVICE_URL or USERS_API_SECRET env')
		return
	}

	const statusValue = status === 'online' ? 1 : 0
	const body: { status: number; lastConnection?: string } = {
		status: statusValue
	}

	// Add lastConnection timestamp when going offline
	if (status === 'offline') {
		body.lastConnection = new Date().toISOString()
	}

	const url = `${base}/api/internal/users/${userId}/status`
	const headers = {
		'Content-Type': 'application/json',
		'X-API-Key': secret
	}
	const options = {
		method: 'PATCH',
		headers,
		body: JSON.stringify(body)
	}

	try {
		const response = await fetch(url, options)

		if (!response.ok) {
			const errorText = await response.text()
			console.error(
				`[STATUS] Failed to update user ${userId} status to ${status}: ${response.status} - ${errorText}`
			)
		} else {
			console.log(`[STATUS] User ${userId} is now ${status.toUpperCase()}`)
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(
			`[STATUS] Error updating user ${userId} status to ${status}:`,
			message
		)
	}
}

/**
 * Add a WebSocket connection for a user
 * If user already has a connection, the old one is closed and replaced
 * @param userId - User ID
 * @param ws - WebSocket instance
 * @returns true if this is the user's first connection (went online), false if replacing existing
 */
export function addConnection(userId: string, ws: WebSocket): boolean {
	const existingConn = wsConnections.get(userId)
	const isFirstConnection = !existingConn

	if (!isFirstConnection) {
		cancelPendingDisconnect(userId)
		try {
			if (existingConn && existingConn.ws.readyState === WebSocket.OPEN) {
				existingConn.ws.close(1000, 'New connection from another tab')
			}
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e)
			console.error(
				`Error closing previous WebSocket for user ${userId}:`,
				message
			)
		}
	}

	wsConnections.set(userId, { ws, lastHeartbeat: new Date() })

	setupWebSocketHandlers(userId, ws)

	if (isFirstConnection) {
		console.log(`User ${userId} is now ONLINE`)
		notifyStatusChange(userId, 'online')
	} else {
		console.log(`User ${userId} reconnected (replaced old connection)`)
	}

	return isFirstConnection
}

/**
 * Remove a WebSocket connection for a user
 * @param userId - User ID
 * @param ws - WebSocket instance (to verify it's the current one)
 * @returns true if this was the user's only connection (went offline), false if connection was already gone
 */
export function removeConnection(userId: string, ws: WebSocket): boolean {
	const currentConn = wsConnections.get(userId)

	if (!currentConn || currentConn.ws !== ws) {
		return false
	}

	wsConnections.delete(userId)

	cancelPendingDisconnect(userId)
	const timer = setTimeout(() => {
		try {
			pendingDisconnectTimers.delete(userId)
			console.log(`User ${userId} disconnect timer expired - marking offline`)
			notifyStatusChange(userId, 'offline')
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.error(`Failed to notify user ${userId} offline status:`, message)
			pendingDisconnectTimers.delete(userId)
		}
	}, DISCONNECT_DELAY_MS) as NodeJS.Timeout

	pendingDisconnectTimers.set(userId, timer)
	console.log(
		`User ${userId} disconnected, offline in ${DISCONNECT_DELAY_MS}ms`
	)

	return true
}

/**
 * Send message to a specific user
 * @param userId - User ID
 * @param message - Message to send (string or object)
 * @returns true if message was sent, false otherwise
 */
export function sendToUser(userId: string, message: unknown): boolean {
	const conn = wsConnections.get(userId)
	if (!conn) return false

	const payload =
		typeof message === 'string' ? message : JSON.stringify(message)

	try {
		if (conn.ws.readyState === WebSocket.OPEN) {
			conn.ws.send(payload)
			return true
		}
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e)
		console.error(`Failed to send message to user ${userId}:`, message)
	}

	return false
}

/**
 * Broadcast message to all connected users
 * @param message - Message to send (string or object)
 */
export function broadcast(message: unknown): void {
	const payload =
		typeof message === 'string' ? message : JSON.stringify(message)
	let totalSent = 0

	for (const [userId, conn] of wsConnections.entries()) {
		try {
			if (conn.ws.readyState === WebSocket.OPEN) {
				conn.ws.send(payload)
				totalSent++
			}
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e)
			console.error(`Failed to broadcast to user ${userId}:`, msg)
		}
	}

	console.log(
		`Broadcast sent to ${totalSent} users, with ${wsConnections.size - totalSent} failures`
	)
}

/**
 * Get total number of active connections across all users
 * @returns Total number of active WebSocket connections
 */
export function getTotalConnections(): number {
	return wsConnections.size
}

/**
 * Cleanup all pending disconnect timers (call on server shutdown)
 */
export function cleanupAllTimers(): void {
	for (const [userId, timer] of pendingDisconnectTimers.entries()) {
		clearTimeout(timer)
		console.log(`Cleared pending timer for user ${userId}`)
	}
	pendingDisconnectTimers.clear()
	console.log('All disconnect timers cleared')
}

/**
 * Close all active WebSocket connections (call on server shutdown)
 */
export function closeAllConnections(): void {
	stopHeartbeat()

	for (const [, conn] of wsConnections.entries()) {
		try {
			if (conn.ws.readyState === WebSocket.OPEN) {
				conn.ws.close(1001, 'Server shutting down')
			}
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e)
			console.error(`Error closing WebSocket:`, message)
		}
	}
	wsConnections.clear()
	console.log('All WebSocket connections closed')
}

startHeartbeat()
