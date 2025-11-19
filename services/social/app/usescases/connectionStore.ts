import WebSocket from 'ws'

interface UserConnection {
	ws: WebSocket
	lastHeartbeat: Date
}

export const wsConnections = new Map<string, UserConnection>()
const HEARTBEAT_INTERVAL_MS = 30000
const PONG_TIMEOUT_MS = 60000
let heartbeatInterval: NodeJS.Timeout | null = null

/** A VOIR
 * Setup event handlers for a WebSocket connection
 * Callback for close/error are handled by the caller (presenceService)
 */
function setupWebSocketHandlers(
	userId: string,
	ws: WebSocket,
	onClose: (userId: string, ws: WebSocket) => void
): void {
	ws.on('pong', () => {
		const conn = wsConnections.get(userId)
		if (conn) {
			conn.lastHeartbeat = new Date()
		}
	})

	ws.on('close', () => {
		onClose(userId, ws)
	})

	ws.on('error', (err: Error) => {
		console.error(`WebSocket error for user ${userId}:`, err.message)
		onClose(userId, ws)
	})
}

/** A VOIR
 * Start heartbeat interval (ping every 30s)
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
}

/**
 * Stop heartbeat interval
 */
function stopHeartbeat(): void {
	if (heartbeatInterval) {
		clearInterval(heartbeatInterval)
		heartbeatInterval = null
	}
}

/** A VOIR
 * Add a WebSocket connection for a user (PURE - no side effects)
 * If user already has a connection, close the old one
 * @param userId - User ID
 * @param ws - WebSocket instance
 * @param onClose - Callback when connection closes/errors
 * @returns true if this is the user's first connection, false if replacing existing
 */
export function addConnection(
	userId: string,
	ws: WebSocket,
	onClose: (userId: string, ws: WebSocket) => void
): boolean {
	const existingConn = wsConnections.get(userId)
	const isFirstConnection = !existingConn

	if (!isFirstConnection) {
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
	setupWebSocketHandlers(userId, ws, onClose)

	if (isFirstConnection) {
		startHeartbeat()
	}

	return isFirstConnection
}

/** A VOIR
 * Remove a WebSocket connection for a user (PURE - just removes from store)
 * @param userId - User ID
 * @param ws - WebSocket instance (to verify it's the current one)
 * @returns true if connection was found and removed, false otherwise
 */
export function removeConnection(userId: string, ws: WebSocket): boolean {
	const currentConn = wsConnections.get(userId)

	if (!currentConn || currentConn.ws !== ws) {
		return false
	}

	wsConnections.delete(userId)
	return true
}

/** A VOIR
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
		const msg = e instanceof Error ? e.message : String(e)
		console.error(`Failed to send message to user ${userId}:`, msg)
	}

	return false
}

/** AVOIR
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

/** A VOIR
 * Check if a user is currently connected
 * @param userId - User ID
 * @returns true if user has an active connection
 */
export function isUserOnline(userId: string): boolean {
	return wsConnections.has(userId)
}

/**
 * Get total number of active connections across all users
 * @returns Total number of active WebSocket connections
 */
export function getTotalConnections(): number {
	return wsConnections.size
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

