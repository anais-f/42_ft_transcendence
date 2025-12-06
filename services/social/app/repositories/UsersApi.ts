import fetch from 'node-fetch'
import { IUserId, IPrivateUser } from '@ft_transcendence/common'
import { UserPrivateProfileSchema } from '@ft_transcendence/common'
import createHttpError from 'http-errors'

export class UsersApi {
	/**
	 * @description Check if a user exists by fetching their public profile
	 * @param user - User ID to check
	 * @returns true if user exists, false otherwise
	 * @throws HttpError if the request fails (non-404 errors)
	 */
	static async userExists(user: IUserId): Promise<boolean> {
		const base = process.env.USERS_SERVICE_URL
		const secret = process.env.USERS_API_SECRET
		if (!base || !secret)
			throw createHttpError.InternalServerError(
				'Missing USERS_SERVICE_URL or USERS_API_SECRET env'
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
			throw createHttpError.BadGateway(
				'Failed to check user existence: ' +
					(err instanceof Error ? err.message : String(err))
			)
		}

		//To check
		if (response.status === 404) return false
		if (!response.ok) {
			let bodyText = ''
			try {
				bodyText = await response.text()
			} catch (_) {
				// ignore
			}
			throw createHttpError.BadGateway(
				`Users service USER EXIST HTTP ${response.status} - ${bodyText}`
			)
		}

		return true
	}

	/**
	 * @description Get user data by ID
	 * @param user - User ID
	 * @returns User data with username, avatar, status, last_connection
	 * @throws HttpError if the request fails or data is invalid
	 */
	static async getUserData(user: IUserId): Promise<IPrivateUser> {
		const base = process.env.USERS_SERVICE_URL
		const secret = process.env.USERS_API_SECRET
		if (!base || !secret)
			throw createHttpError.InternalServerError(
				'Missing USERS_SERVICE_URL or USERS_API_SECRET env'
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
			throw createHttpError.BadGateway(
				'Failed to fetch user data: ' +
					(err instanceof Error ? err.message : String(err))
			)
		}

		if (response.status === 404)
			throw createHttpError.NotFound('User not found')
		if (!response.ok) {
			let bodyText = ''
			try {
				bodyText = await response.text()
			} catch (_) {}
			throw createHttpError.BadGateway(
				`Users service HTTP ${response.status} - ${bodyText}`
			)
		}

		const data = await response.json()
		const parsed = UserPrivateProfileSchema.safeParse(data)

		if (!parsed.success)
			throw createHttpError.BadGateway('Invalid user data from users service')

		return parsed.data as IPrivateUser
	}
}
