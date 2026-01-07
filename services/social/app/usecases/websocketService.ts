import WebSocket from 'ws'
import { addConnection, getTotalConnections } from './connectionManager.js'
import { UsersApi } from '../repositories/UsersApi.js'
import { WSMessageType, WSCloseCodes } from '@ft_transcendence/common'

export async function initializeConnection(
	socket: WebSocket,
	userId: number,
	userLogin: string
): Promise<{ username: string; totalConnected: number }> {
	try {
		await addConnection(userId, socket)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		socket.close(1011, WSCloseCodes.SERVER_ERROR)
		throw error
	}

	let username = userLogin
	try {
		const userData = await UsersApi.getUserData({ user_id: userId })
		username = userData.username ?? userLogin
	} catch (error) {}

	const totalConnected = getTotalConnections()

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
