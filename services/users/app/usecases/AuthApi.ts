import fetch from 'node-fetch'
import {
	PublicUserListAuthDTO,
	PublicUserListAuthSchema,
	AppError
} from '@ft_transcendence/common'

// TODO: update password via auth service
// TODO: error handling with try/catch and custom errors

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
			throw new AppError('Missing AUTH_SERVICE_URL or INTERNAL_API_SECRET env', 500)

		const url = `${base}/api/users`
		const headers = {
			'content-type': 'application/json',
			authorization: secret
		}
		const options = { method: 'GET', headers: headers }

		try {
			const response = await fetch(url, options)
			if (!response.ok) {
				throw new AppError(`Auth service HTTP ${response.status}`, 502)
			}
			const raw = (await response.json()) as PublicUserListAuthDTO
			const parsed = PublicUserListAuthSchema.safeParse(raw)
			if (!parsed.success)
				throw new AppError(
					'Invalid response shape from auth service: ' + parsed.error.message,
					500
				)

			return parsed.data.users
		} catch (err) {
			if (err instanceof AppError) throw err
			throw new AppError(
				'Failed to fetch users from auth: ' + (err as Error).message,
				502
			)
		}
	}
}
