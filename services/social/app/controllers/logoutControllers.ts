import { FastifyRequest, FastifyReply } from 'fastify'
import {
	removeConnection,
	wsConnections
} from '../usescases/connectionManager.js'
import { handleUserOffline } from '../usescases/presenceService.js'

/**
 * Handle user logout - mark user as offline and close WebSocket connection
 * Called by Frontend: POST /api/logout/:userId (with JWT, user can only logout themselves)
 * @param request - Fastify request with userId (number) in params and JWT
 * @param reply - Fastify reply
 */
export async function handleLogout(
	request: FastifyRequest<{ Params: { userId: number } }>,
	reply: FastifyReply
): Promise<void> {
	const targetUserId = String(request.params.userId)
	const userFromToken = (request as any).user

	try {
		if (!userFromToken) {
			return reply.code(401).send({
				success: false,
				error: 'Not authenticated'
			})
		}

		const userIdFromToken = String(userFromToken.user_id)
		if (userIdFromToken !== targetUserId) {
			console.warn(
				`Security: User ${userIdFromToken} tried to logout user ${targetUserId}`
			)
			return reply.code(403).send({
				success: false,
				error: 'You can only logout yourself'
			})
		}

		const conn = wsConnections.get(targetUserId)

		if (conn) {
			if (conn.ws.readyState === 1) {
				conn.ws.close(1000, 'User logged out')
			}
			removeConnection(targetUserId, conn.ws)
		} else {
			await handleUserOffline(targetUserId)
		}

		reply.code(200).send({
			success: true,
			message: `User ${targetUserId} logged out successfully`
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(`Failed to handle logout for user ${targetUserId}:`, message)
		reply.code(500).send({
			success: false,
			error: 'Failed to handle logout'
		})
	}
}
