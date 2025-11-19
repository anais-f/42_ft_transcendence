import WebSocket from 'ws'

export const wsConnections = new Map<string, WebSocket>()
const pendingDisconnectTimers = new Map<string, number>()
const DISCONNECT_DELAY_MS = 5000

/**
 * Cancel pending disconnect timer for a user
 * @param userId
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
 * This will be called to send PATCH request to users service
 * @param userId - User ID
 * @param status - 'online' or 'offline'
 */
function notifyStatusChange(
	userId: string,
	status: 'online' | 'offline'
): void {
	// TODO: Call PATCH /api/internal/users/:id/status endpoint here
	console.log(
		`[STATUS] User ${userId} is now ${status.toUpperCase()} (after ${DISCONNECT_DELAY_MS}ms delay)`
	)
}

/**
 * Add a WebSocket connection for a user
 * If user already has a connection, the old one is closed and replaced
 * @param userId - User ID
 * @param ws - WebSocket instance
 * @returns true if this is the user's first connection (went online), false if replacing existing
 */
export function addConnection(userId: string, ws: WebSocket): boolean {
	const existingWs = wsConnections.get(userId)
	const isFirstConnection = !existingWs

	if (!isFirstConnection) {
		cancelPendingDisconnect(userId)
		try {
			if (existingWs && existingWs.readyState === WebSocket.OPEN) {
				existingWs.close(1000, 'New connection from another tab')
			}
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e)
			console.error(
				`Error closing previous WebSocket for user ${userId}:`,
				message
			)
		}
	}

	wsConnections.set(userId, ws)

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
	const currentWs = wsConnections.get(userId)

	if (!currentWs || currentWs !== ws) {
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
	}, DISCONNECT_DELAY_MS)

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
	const ws = wsConnections.get(userId)
	if (!ws) return false

	const payload =
		typeof message === 'string' ? message : JSON.stringify(message)

	try {
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(payload)
			return true
		}
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e)
		console.error(`Failed to send websocket to user ${userId}:`, message)
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

	for (const [userId, ws] of wsConnections.entries()) {
		try {
			if (ws.readyState === WebSocket.OPEN) {
				ws.send(payload)
				totalSent++
			}
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e)
			console.error(`Failed to broadcast to user ${userId}:`, message)
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
 * Check if a user has an active connection
 * @param userId - User ID
 * @returns true if user is connected
 */
export function hasUser(userId: string): boolean {
	return wsConnections.has(userId)
}

/**
 * Cleanup all pending disconnect timers (call on server shutdown)
 * @return void
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
 * @return void
 */
export function closeAllConnections(): void {
	for (const [userId, ws] of wsConnections.entries()) {
		try {
			if (ws.readyState === WebSocket.OPEN) {
				ws.close(1001, 'Server shutting down')
			}
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e)
			console.error(`Error closing WebSocket for user ${userId}:`, message)
		}
	}
	wsConnections.clear()
	console.log('All WebSocket connections closed')
}
