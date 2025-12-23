import fetch from 'node-fetch'
import {
	PublicUserListAuthDTO,
	PublicUserListAuthSchema
} from '@ft_transcendence/common'
import createHttpError from 'http-errors'
import { env } from '../env/checkEnv.js'

export class AuthApi {
	/**
	 * @description Fetch all users from the auth service
	 * @returns Array of users with user_id and username
	 * @throws Error if the request fails
	 */
	static async getAllUsers() {
		const base = env.AUTH_SERVICE_URL
		const secret = env.INTERNAL_API_SECRET

		const url = `${base}/api/internal/users`
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

	/**
	 * @description Get 2FA status for a user from auth service
	 * @param userId - The user ID
	 * @returns Boolean indicating if 2FA is enabled
	 * @throws Error if the request fails
	 */
	static async get2FAStatus(userId: number): Promise<boolean> {
		const base = env.AUTH_SERVICE_URL
		const secret = env.INTERNAL_API_SECRET

		const url = `${base}/api/internal/2fa/status/${userId}`
		const headers = {
			'content-type': 'application/json',
			authorization: secret
		}
		let response
		try {
			response = await fetch(url, {
				method: 'GET',
				headers,
				signal: AbortSignal.timeout(5000)
			})
		} catch (err: unknown) {
			const error = err as Error
			if (error.name === 'TimeoutError' || error.name === 'AbortError') {
				throw createHttpError.GatewayTimeout('Auth service timeout')
			}
			throw createHttpError.BadGateway(
				'Failed to fetch 2FA status from auth: ' + error.message
			)
		}
		if (!response.ok)
			throw createHttpError.BadGateway(`Auth service HTTP ${response.status}`)
		const raw = (await response.json()) as { enabled: boolean }
		return raw.enabled
	}
}
