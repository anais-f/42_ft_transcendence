import { UserStatus } from '@ft_transcendence/common'
import {
	broadcastStatusChangeToFriends,
	broadcastPresenceToAll
} from './broadcasterService.js'
import { env } from '../env/checkEnv.js'

/**
 * Notify users service about status change
 * @param userId - User ID
 * @param status - UserStatus enum value
 */
async function notifyStatusChange(
	userId: number,
	status: UserStatus
): Promise<void> {
	const base = env.USERS_SERVICE_URL
	const secret = env.INTERNAL_API_SECRET

	const body: { status: UserStatus; lastConnection?: string } = {
		status: status
	}

	if (status === UserStatus.OFFLINE) {
		body.lastConnection = new Date().toISOString()
	}

	const url = `${base}/api/internal/users/${userId}/status`
	const headers = {
		'Content-Type': 'application/json',
		'X-API-Key': secret
	}
	const options = {
		method: 'PATCH',
		headers,
		body: JSON.stringify(body)
	}

	try {
		const response = await fetch(url, options)

		if (!response.ok) {
			const errorText = await response.text()
			console.error(
				`[STATUS] Failed to update user ${userId} status to ${status}: ${response.status} - ${errorText}`
			)
		} else {
			const statusName = status === UserStatus.ONLINE ? 'ONLINE' : 'OFFLINE'
			console.log(`[STATUS] User ${userId} is now ${statusName}`)
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(
			`[STATUS] Error updating user ${userId} status to ${status}:`,
			message
		)
	}
}

/**
 * Handle user coming online
 * Sends two types of broadcasts:
 * 1. To friends: Update their "My Friends" list with status
 * 2. To all: Update public profile pages where this user's status is visible
 * Note: Friends receive both notifications (intentional for different UI contexts)
 * @param userId
 */
export async function handleUserOnline(userId: number): Promise<void> {
	console.log(`User ${userId} is now ONLINE`)
	try {
		await notifyStatusChange(userId, UserStatus.ONLINE)
		await broadcastStatusChangeToFriends(userId, UserStatus.ONLINE)
		await broadcastPresenceToAll(userId, UserStatus.ONLINE)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(`Failed to notify user ${userId} online status:`, message)
	}
}

/**
 * Handle user going offline
 * Sends two types of broadcasts (see handleUserOnline for details)
 * @param userId
 */
export async function handleUserOffline(userId: number): Promise<void> {
	console.log(`User ${userId} disconnect timer expired - marking offline`)
	try {
		await notifyStatusChange(userId, UserStatus.OFFLINE)
		await broadcastStatusChangeToFriends(userId, UserStatus.OFFLINE)
		await broadcastPresenceToAll(userId, UserStatus.OFFLINE)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(`Failed to notify user ${userId} offline status:`, message)
	}
}
