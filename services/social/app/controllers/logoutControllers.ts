import { FastifyRequest, FastifyReply } from 'fastify'
import {
	removeConnection,
	wsConnections
} from '../usecases/connectionManager.js'
import { handleUserOffline } from '../usecases/presenceService.js'

/**
 * Handle user logout - mark user as offline and close WebSocket connection
 * Called by Frontend: POST /api/logout/:userId (with JWT, user can only logout themselves)
 * @param request - Fastify request with userId (number) in params and JWT
 * @param reply - Fastify reply
 */
export async function handleLogout(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const params = request.params as { userId: number }
	const targetUserIdNum = params.userId
	const userFromToken = request.user

	try {
		if (!userFromToken) {
			void reply.code(401).send({
				success: false,
				error: 'Not authenticated'
			})
			return
		}

		if (userFromToken.user_id !== targetUserIdNum) {
			console.warn(
				`Security: User ${userFromToken.user_id} tried to logout user ${targetUserIdNum}`
			)
			void reply.code(403).send({
				success: false,
				error: 'You can only logout yourself'
			})
			return
		}

		const targetUserKey = String(targetUserIdNum)
		const conn = wsConnections.get(targetUserKey)

		if (conn) {
			if (conn.ws.readyState === 1) {
				conn.ws.close(1000, 'User logged out')
			}
			removeConnection(targetUserKey, conn.ws)
		} else {
			await handleUserOffline(targetUserKey)
		}

		void reply.code(200).send({
			success: true,
			message: `User ${targetUserKey} logged out successfully`
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(
			`Failed to handle logout for user ${targetUserIdNum}:`,
			message
		)
		void reply.code(500).send({
			success: false,
			error: 'Failed to handle logout'
		})
	}
}
