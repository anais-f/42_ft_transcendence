import fetch from 'node-fetch'
import { AppError, IUserId } from '@ft_transcendence/common'

export class UsersApi {
	/**
	 * @description Check if a user exists by fetching their public profile
	 * @param user - User ID to check
	 * @returns true if user exists, false otherwise
	 * @throws AppError if the request fails (non-404 errors)
	 */
	static async userExists(user: IUserId): Promise<boolean> {
		const base = process.env.USERS_SERVICE_URL
		const secret = process.env.USERS_API_SECRET
		if (!base || !secret)
			throw new AppError(
				'Missing USERS_SERVICE_URL or USERS_API_SECRET env',
				500
			)

		const url = `${base}/api/users/${user.user_id}`
		const headers = {
			'content-type': 'application/json',
			authorization: secret
		}
		const options = { method: 'GET', headers: headers }

		try {
			const response = await fetch(url, options)
			if (response.status === 404) {
				return false
			}
			if (!response.ok) {
				throw new AppError(`Users service HTTP ${response.status}`, 502)
			}
			return true
		} catch (err) {
			if (err instanceof AppError) throw err
			throw new AppError(
				'Failed to check user existence: ' + (err as Error).message,
				502
			)
		}
	}
}
