import { handlePong, startHeartbeat } from './heartbeatService.js'
import { handleUserOnline, handleUserOffline } from './presenceService.js'
import WebSocket from 'ws'

interface UserConnection {
	ws: WebSocket
	lastHeartbeat: Date
}

export const wsConnections = new Map<string, UserConnection>()
const pendingDisconnectTimers = new Map<number, NodeJS.Timeout>()
const DISCONNECT_DELAY_MS = 2000

/**
 * Setup event handlers for a WebSocket connection
 * @param userId - User ID
 * @param ws - WebSocket instance
 */
function setupWebSocketHandlers(userId: number, ws: WebSocket): void {
	ws.on('pong', () => {
		handlePong(userId)
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
 * Cancel pending disconnect timer for a user
 * @param userId - User ID
 */
function cancelPendingDisconnect(userId: number): void {
	const timer = pendingDisconnectTimers.get(userId)
	if (timer) {
		clearTimeout(timer)
		pendingDisconnectTimers.delete(userId)
	}
}

/**
 * Add a WebSocket connection for a user
 * If user already has a connection, the old one is closed and replaced
 * @param userId - User ID
 * @param ws - WebSocket instance
 * @returns true if this is the user's first connection (went online), false if replacing existing
 */
export async function addConnection(
	userId: number,
	ws: WebSocket
): Promise<boolean> {
	const existingConn = wsConnections.get(String(userId))
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

	wsConnections.set(String(userId), { ws, lastHeartbeat: new Date() })

	setupWebSocketHandlers(userId, ws)

	if (isFirstConnection) {
		try {
			await handleUserOnline(userId)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.error(`Failed to notify user ${userId} online status:`, message)
		}
	}

	return isFirstConnection
}

/**
 * Remove a WebSocket connection for a user
 * @param userId - User ID
 * @param ws - WebSocket instance (to verify it's the current one)
 * @returns true if this was the user's only connection (went offline), false if connection was already gone
 */
export function removeConnection(userId: number, ws: WebSocket): boolean {
	const currentConn = wsConnections.get(String(userId))

	if (!currentConn || currentConn.ws !== ws) {
		return false
	}

	wsConnections.delete(String(userId))

	cancelPendingDisconnect(userId)
	const timer = setTimeout(async () => {
		try {
			pendingDisconnectTimers.delete(userId)
			await handleUserOffline(userId)
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
export function sendToUser(userId: number, message: unknown): boolean {
	const conn = wsConnections.get(String(userId))
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
 * Get total number of connected users
 */
export function getTotalConnections(): number {
	return wsConnections.size
}

export function getOnlineUsers(): number[] {
	const onlineUsers: number[] = []
	for (const userId of wsConnections.keys()) {
		onlineUsers.push(Number(userId))
	}
	return onlineUsers
}

startHeartbeat()
