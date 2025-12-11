import fetch from 'node-fetch'
import {
	PublicUserListAuthDTO,
	PublicUserListAuthSchema
} from '@ft_transcendence/common'
import createHttpError from 'http-errors'

export class AuthApi {
	/**
	 * @description Fetch all users from the auth service
	 * @returns Array of users with user_id and username
	 * @throws Error if the request fails
	 */
	static async getAllUsers() {
		const base = process.env.AUTH_SERVICE_URL
		const secret = process.env.INTERNAL_API_SECRET
		if (!base || !secret)
			throw createHttpError.InternalServerError(
				'Missing AUTH_SERVICE_URL or INTERNAL_API_SECRET env'
			)

		const url = `${base}/api/users`
		const headers = {
			'content-type': 'application/json',
			authorization: secret
		}

		let response
		try {
			response = await fetch(url, {
				method: 'GET',
				headers,
				signal: AbortSignal.timeout(10000)
			})
		} catch (err: any) {
			if (err.name === 'TimeoutError' || err.name === 'AbortError') {
				throw createHttpError.GatewayTimeout('Auth service timeout')
			}
			throw createHttpError.BadGateway(
				'Failed to fetch users from auth: ' + err.message
			)
		}

		if (!response.ok)
			throw createHttpError.BadGateway(`Auth service HTTP ${response.status}`)

		const raw = (await response.json()) as PublicUserListAuthDTO
		const parsed = PublicUserListAuthSchema.safeParse(raw)
		if (!parsed.success)
			throw createHttpError.InternalServerError(
				'Invalid response shape from auth service: ' + parsed.error.message
			)

		return parsed.data.users
	}
}
