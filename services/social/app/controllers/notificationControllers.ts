import { FastifyRequest, FastifyReply } from 'fastify'
import { UserStatus } from '@ft_transcendence/common'
import { broadcastStatusChangeToFriends } from '../usecases/broadcasterService.js'

/**
 * Handle incoming status change notification from Users Service
 * POST /api/internal/notifications/broadcast-status
 *
 * Body is validated by Zod schema before reaching this handler
 * Body: {
 *   userId: number (positive integer),
 *   status: number (0 = OFFLINE, 1 = ONLINE, 2 = BUSY),
 *   timestamp: string (ISO datetime format)
 * }
 */
export async function broadcastStatusNotificationController(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	try {
		const { userId, status, timestamp } = req.body as {
			userId: number
			status: UserStatus
			timestamp: string
		}

		// Broadcast to friends
		// No validation needed here - Zod already validated in the route schema
		await broadcastStatusChangeToFriends(String(userId), status)

		return void reply.code(200).send({
			success: true,
			message: `Status change broadcasted for user ${userId}`
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(`Error in broadcastStatusNotificationController:`, message)

		return void reply.code(500).send({
			success: false,
			error: 'Internal server error'
		})
	}
}
