import fetch from 'node-fetch'
import { AppError, IUserId, IPrivateUser } from '@ft_transcendence/common'
import { UserPrivateProfileSchema } from '@ft_transcendence/common'

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

		const url = `${base}/api/internal/users/profile/${user.user_id}`
		const headers = {
			'content-type': 'application/json',
			authorization: secret
		}
		const options = { method: 'GET', headers }

		let response
		try {
			response = await fetch(url, options)
		} catch (err) {
			throw new AppError(
				'Failed to check user existence: ' + (err as Error).message,
				502
			)
		}

		//REVOIR
		if (response.status === 404) return false
		if (!response.ok) {
			let bodyText = ''
			try {
				bodyText = await response.text()
			} catch (_) {
				// ignore
			}
			throw new AppError(
				`Users service USER EXIST HTTP ${response.status} - ${bodyText}`,
				502
			)
		}

		return true
	}

	/**
	 * @description Get user data by ID
	 * @param user - User ID
	 * @returns User data with username, avatar, status, last_connection
	 * @throws AppError if the request fails or data is invalid
	 */
	static async getUserData(user: IUserId): Promise<IPrivateUser> {
		const base = process.env.USERS_SERVICE_URL
		const secret = process.env.USERS_API_SECRET
		if (!base || !secret)
			throw new AppError(
				'Missing USERS_SERVICE_URL or USERS_API_SECRET env',
				500
			)

		const url = `${base}/api/internal/users/profile/${user.user_id}`
		const headers = {
			'content-type': 'application/json',
			authorization: secret
		}
		const options = { method: 'GET', headers }

		let response
		try {
			response = await fetch(url, options)
		} catch (err) {
			throw new AppError(
				'Failed to fetch user data: ' + (err as Error).message,
				502
			)
		}

		if (response.status === 404) throw new AppError('User not found', 404)
		// if (!response.ok) throw new AppError(`Users service HTTP ${response.status}`, 502)
		if (!response.ok) {
			let bodyText = ''
			try {
				bodyText = await response.text()
			} catch (_) {}
			throw new AppError(
				`Users service HTTP ${response.status} - ${bodyText}`,
				502
			)
		}

		const data = await response.json()

		return UserPrivateProfileSchema.parse(data)
	}
}
