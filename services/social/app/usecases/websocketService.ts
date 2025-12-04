import WebSocket from 'ws'
import { addConnection, getTotalConnections } from './connectionManager.js'
import { UsersApi } from '../repositories/UsersApi.js'
import { WSMessageType, WSCloseCodes } from '@ft_transcendence/common'

/**
 * Initialize WebSocket connection: add to connection manager, fetch user data, send welcome
 * @param socket WebSocket connection
 * @param userId User ID
 * @param userLogin User login (fallback username)
 * @returns Object with username and total connected users
 */
export async function initializeConnection(
	socket: WebSocket,
	userId: number,
	userLogin: string
): Promise<{ username: string; totalConnected: number }> {
	try {
		await addConnection(userId, socket)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(`Failed to add connection for user ${userId}:`, message)
		socket.close(1011, WSCloseCodes.SERVER_ERROR)
		throw error
	}

	let username = userLogin
	try {
		const userData = await UsersApi.getUserData({ user_id: userId })
		username = userData.username ?? userLogin
	} catch (error) {
		console.error(`Failed to fetch user data for user ${userId}:`, error)
	}

	const totalConnected = getTotalConnections()
	console.log(`[WS] ${username} (${userId}) connected`)
	console.log(`Total: ${totalConnected}`)

	socket.send(
		JSON.stringify({
			type: WSMessageType.CONNECTION_ESTABLISHED,
			data: {
				userId,
				username,
				totalConnected,
				timestamp: new Date().toISOString()
			}
		})
	)

	return { username, totalConnected }
}
