import { UserStatus } from '@ft_transcendence/common'
import { broadcastStatusChangeToFriends } from './broadcasterService.js'

/**
 * Notify users service about status change
 * @param userId - User ID
 * @param status - UserStatus enum value
 */
async function notifyStatusChange(
	userId: string,
	status: UserStatus
): Promise<void> {
	const base = process.env.USERS_SERVICE_URL
	const secret = process.env.USERS_API_SECRET
	if (!base || !secret) {
		console.error('Missing USERS_SERVICE_URL or USERS_API_SECRET env')
		return
	}

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
 * @param userId
 */
export async function handleUserOnline(userId: string): Promise<void> {
	console.log(`User ${userId} is now ONLINE`)
	try {
		await notifyStatusChange(userId, UserStatus.ONLINE)
		await broadcastStatusChangeToFriends(userId, UserStatus.ONLINE)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(`Failed to notify user ${userId} online status:`, message)
	}
}

/**
 * Handle user going offline
 * @param userId
 */
export async function handleUserOffline(userId: string): Promise<void> {
	console.log(`User ${userId} disconnect timer expired - marking offline`)
	try {
		await notifyStatusChange(userId, UserStatus.OFFLINE)
		await broadcastStatusChangeToFriends(userId, UserStatus.OFFLINE)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(`Failed to notify user ${userId} offline status:`, message)
	}
}
