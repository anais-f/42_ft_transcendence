import { handlePong } from './heartbeatService.js'
import { handleUserOnline, handleUserOffline } from './presenceService.js'
import WebSocket from 'ws'
import { connectedUsersGauge } from '@ft_transcendence/monitoring'

interface UserConnection {
	ws: WebSocket
	lastHeartbeat: Date
}

export const wsConnections = new Map<number, UserConnection>()
const pendingDisconnectTimers = new Map<number, NodeJS.Timeout>()
const DISCONNECT_DELAY_MS = 2000

function updateConnectedUsersMetric(): void {
	const count = wsConnections.size
	connectedUsersGauge.set(count)
}

function setupWebSocketHandlers(userId: number, ws: WebSocket): void {
	ws.on('pong', () => {
		handlePong(userId)
	})

	ws.on('close', () => {
		removeConnection(userId, ws)
	})

	ws.on('error', (err: Error) => {
		removeConnection(userId, ws)
	})
}

function cancelPendingDisconnect(userId: number): void {
	const timer = pendingDisconnectTimers.get(userId)
	if (timer) {
		clearTimeout(timer)
		pendingDisconnectTimers.delete(userId)
	}
}

/**
 * Registers a new WebSocket connection for a user.
 *
 * Behavior:
 * - Cancels any pending disconnect timer (allows quick page reload)
 * - Replaces existing connection if user already connected (new tab)
 * - Only triggers handleUserOnline on first connection (not on reconnect)
 *
 * IMPORTANT: Returns true only for first connection, false for tab switches.
 * This prevents duplicate "user came online" notifications on page reload.
 *
 * @returns true if this is the user's first connection, false if replacing existing
 */
export async function addConnection(
	userId: number,
	ws: WebSocket
): Promise<boolean> {
	const existingConn = wsConnections.get(userId)
	const isFirstConnection = !existingConn

	cancelPendingDisconnect(userId)

	if (!isFirstConnection) {
		try {
			if (existingConn && existingConn.ws.readyState === WebSocket.OPEN) {
				existingConn.ws.close(1000, 'New connection from another tab')
			}
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e)
		}
	}

	setupWebSocketHandlers(userId, ws)

	wsConnections.set(userId, { ws, lastHeartbeat: new Date() })

	updateConnectedUsersMetric()

	if (isFirstConnection) {
		try {
			await handleUserOnline(userId)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
		}
	}

	return isFirstConnection
}

/**
 * Removes a WebSocket connection with delayed offline notification.
 *
 * IMPORTANT: Waits 2 seconds before marking user offline to handle quick
 * page reloads. If user reconnects during this delay (via addConnection),
 * the timer is cancelled and user stays online seamlessly.
 *
 * This prevents:
 * - Flickering online/offline status during page navigation
 * - Unnecessary "user went offline" notifications to friends
 * - Race conditions between disconnect and reconnect events
 *
 * @returns true if connection removed, false if not found or already removed
 */
export function removeConnection(userId: number, ws: WebSocket): boolean {
	const currentConn = wsConnections.get(userId)

	if (!currentConn || currentConn.ws !== ws) {
		return false
	}

	wsConnections.delete(userId)

	updateConnectedUsersMetric()

	cancelPendingDisconnect(userId)
	const timer = setTimeout(async () => {
		try {
			pendingDisconnectTimers.delete(userId)
			await handleUserOffline(userId)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			pendingDisconnectTimers.delete(userId)
		}
	}, DISCONNECT_DELAY_MS) as NodeJS.Timeout

	pendingDisconnectTimers.set(userId, timer)

	return true
}

export function sendToUser(userId: number, message: unknown): boolean {
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
	}

	return false
}

export function getTotalConnections(): number {
	return wsConnections.size
}
