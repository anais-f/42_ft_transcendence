import fetch from 'node-fetch'
import { IUserId, IPublicProfileUser } from '@ft_transcendence/common'
import { UserPublicProfileSchema } from '@ft_transcendence/common'
import createHttpError from 'http-errors'
import { env } from '../env/checkEnv.js'

export class UsersApi {
	static async userExists(user: IUserId): Promise<boolean> {
		const base = env.USERS_SERVICE_URL
		const secret = env.INTERNAL_API_SECRET

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

	static async getUserData(user: IUserId): Promise<IPublicProfileUser> {
		const base = env.USERS_SERVICE_URL
		const secret = env.INTERNAL_API_SECRET

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
		const parsed = UserPublicProfileSchema.safeParse(data)

		if (!parsed.success)
			throw createHttpError.BadGateway('Invalid user data from users service')

		return parsed.data as IPublicProfileUser
	}
}
