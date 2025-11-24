/**
 * Notify users service about status change
 * @param userId - User ID
 * @param status - 'online' or 'offline'
 */
async function notifyStatusChange(
	userId: string,
	status: 'online' | 'offline'
): Promise<void> {
	const base = process.env.USERS_SERVICE_URL
	const secret = process.env.USERS_API_SECRET
	if (!base || !secret) {
		console.error('Missing USERS_SERVICE_URL or USERS_API_SECRET env')
		return
	}

	const statusValue = status === 'online' ? 1 : 0
	const body: { status: number; lastConnection?: string } = {
		status: statusValue
	}

	if (status === 'offline') {
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
			console.log(`[STATUS] User ${userId} is now ${status.toUpperCase()}`)
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
		await notifyStatusChange(userId, 'online')
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
		await notifyStatusChange(userId, 'offline')
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(`Failed to notify user ${userId} offline status:`, message)
	}
}
