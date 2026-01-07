import { UserStatus } from '@ft_transcendence/common'
import { broadcastStatusChangeToFriends } from './broadcasterService.js'
import { env } from '../env/checkEnv.js'

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
		} else {
			const statusName = status === UserStatus.ONLINE ? 'ONLINE' : 'OFFLINE'
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
	}
}

export async function handleUserOnline(userId: number): Promise<void> {
	try {
		await notifyStatusChange(userId, UserStatus.ONLINE)
		await broadcastStatusChangeToFriends(userId, UserStatus.ONLINE)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
	}
}

export async function handleUserOffline(userId: number): Promise<void> {
	try {
		await notifyStatusChange(userId, UserStatus.OFFLINE)
		await broadcastStatusChangeToFriends(userId, UserStatus.OFFLINE)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
	}
}
