import { FastifyRequest, FastifyReply } from 'fastify'
import {
	removeConnection,
	wsConnections
} from '../usecases/connectionManager.js'
import { handleUserOffline } from '../usecases/presenceService.js'

/**
 * Handle user logout - mark user as offline and close WebSocket connection
 * Called by Frontend: POST /api/logout/me (uses JWT to identify the user)
 * @param request - Fastify request with JWT (user id inside request.user)
 * @param reply - Fastify reply
 */
export async function handleLogout(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const userFromToken = request.user as any
	const userIdValue = userFromToken?.user_id
	if (typeof userIdValue !== 'number') {
		void reply.code(401).send({ success: false, error: 'Unauthorized' })
		return
	}

	try {
		const conn = wsConnections.get(String(userIdValue))

		if (conn) {
			if (conn.ws.readyState === 1) {
				conn.ws.close(1000, 'User logged out')
			}
			removeConnection(userIdValue, conn.ws)
		} else {
			await handleUserOffline(userIdValue)
		}

		void reply.code(200).send({
			success: true,
			message: `User ${userIdValue} logged out successfully`
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(`Failed to handle logout for user ${userIdValue}:`, message)
		void reply.code(500).send({
			success: false,
			error: 'Failed to handle logout'
		})
	}
}
