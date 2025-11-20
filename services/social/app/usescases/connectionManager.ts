import WebSocket from 'ws'
import { handlePong, startHeartbeat } from './heartbeatService.js'
import { handleUserOnline, handleUserOffline } from './presenceService.js'

interface UserConnection {
	ws: WebSocket
	lastHeartbeat: Date
	watchingFriends: number[]
}

export const wsConnections = new Map<string, UserConnection>()
const pendingDisconnectTimers = new Map<string, NodeJS.Timeout>()
const DISCONNECT_DELAY_MS = 5000

/**
 * Setup event handlers for a WebSocket connection
 * @param userId - User ID
 * @param ws - WebSocket instance
 */
function setupWebSocketHandlers(userId: string, ws: WebSocket): void {
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
function cancelPendingDisconnect(userId: string): void {
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
	userId: string,
	ws: WebSocket
): Promise<boolean> {
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

	wsConnections.set(userId, { ws, lastHeartbeat: new Date(), watchingFriends: [] })

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
export function removeConnection(userId: string, ws: WebSocket): boolean {
	const currentConn = wsConnections.get(userId)

	if (!currentConn || currentConn.ws !== ws) {
		return false
	}

	wsConnections.delete(userId)

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
 * Get total number of connected users
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

/*----------- A REVOIR -----------*/
// TODO : // TODO : revoir ce morceau de watch
/**
 * Register that a user wants to watch updates for a list of friends
 * @param userId - User ID watching
 * @param friendIds - List of friend IDs to watch
 */
export function watchFriendsList(userId: string, friendIds: number[]): void {
	const conn = wsConnections.get(userId)
	if (!conn) {
		console.warn(`Cannot watch friends list: user ${userId} not connected`)
		return
	}
	conn.watchingFriends = friendIds
	console.log(`User ${userId} now watching friends: ${friendIds.join(', ')}`)
}

/**
 * Unregister that a user wants to watch updates
 * @param userId - User ID
 */
export function unwatchFriendsList(userId: string): void {
	const conn = wsConnections.get(userId)
	if (!conn) return
	conn.watchingFriends = []
	console.log(`User ${userId} stopped watching friends list`)
}

/**
 * Send status change notification to all users watching this friend
 * @param friendId - Friend whose status changed
 * @param message - Message to send
 * @returns number of users notified
 */
export function notifyFriendsWatching(
	friendId: number,
	message: unknown
): number {
	let notifiedCount = 0
	const payload =
		typeof message === 'string' ? message : JSON.stringify(message)

	for (const [userId, conn] of wsConnections.entries()) {
		// Check if this connection is watching the friend
		if (conn.watchingFriends.includes(friendId)) {
			try {
				if (conn.ws.readyState === WebSocket.OPEN) {
					conn.ws.send(payload)
					notifiedCount++
				}
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e)
				console.error(`Failed to notify user ${userId}:`, msg)
			}
		}
	}

	if (notifiedCount > 0) {
		console.log(
			`[Friends Watching] Notified ${notifiedCount} users about friend ${friendId} status change`
		)
	}

	return notifiedCount
}
/*---------- FIN A REVOIR ---------*/

startHeartbeat()
