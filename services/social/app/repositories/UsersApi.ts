import fetch from 'node-fetch'
import { AppError, IUserId, IPrivateUser } from '@ft_transcendence/common'
import { UserPrivateProfileSchema } from '@ft_transcendence/common'

//TODO : delete this function and use a proper logger
function maskAuthHeader(header?: string): string {
	if (!header) return 'none'
	if (header.startsWith('Bearer ')) return 'Bearer *****'
	return 'API-SECRET *****'
}

export class UsersApi {
	/**
	 * @description Check if a user exists by fetching their public profile
	 * @param user - User ID to check
	 * @param bearer - Optional Authorization header to forward (e.g. 'Bearer <jwt>')
	 * @returns true if user exists, false otherwise
	 * @throws AppError if the request fails (non-404 errors)
	 */
	static async userExists(user: IUserId, bearer?: string): Promise<boolean> {
		const base = process.env.USERS_SERVICE_URL
		const secret = process.env.USERS_API_SECRET
		if (!base || !secret)
			throw new AppError(
				'Missing USERS_SERVICE_URL or USERS_API_SECRET env',
				500
			)

    //REVOIR
		// If a bearer token was provided, call the public endpoint which expects JWT.
		// Otherwise call the internal endpoint protected by API key.
		const usePublic = Boolean(bearer)
		const url = usePublic
			? `${base}/api/users/${user.user_id}`
			: `${base}/api/internal/users/${user.user_id}`
		const authorizationHeader = bearer ?? secret
		const headers = {
			'content-type': 'application/json',
			authorization: authorizationHeader
		}
		const options = { method: 'GET', headers: headers }

		console.debug(
			`[UsersApi] userExists calling ${url} with auth=${maskAuthHeader(
				authorizationHeader
			)}`
		)

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
	 * @param bearer - Optional Authorization header to forward
	 * @returns User data with username, avatar, status, last_connection
	 * @throws AppError if the request fails or data is invalid
	 */
	static async getUserData(user: IUserId, bearer?: string): Promise<IPrivateUser> {
		const base = process.env.USERS_SERVICE_URL
		const secret = process.env.USERS_API_SECRET
		if (!base || !secret)
			throw new AppError(
				'Missing USERS_SERVICE_URL or USERS_API_SECRET env',
				500
			)

		const usePublic = Boolean(bearer)
		const url = usePublic
			? `${base}/api/users/${user.user_id}`
			: `${base}/api/internal/users/${user.user_id}`
		const authorizationHeader = bearer ?? secret
		const headers = {
			'content-type': 'application/json',
			authorization: authorizationHeader
		}
		const options = { method: 'GET', headers: headers }

		console.debug(
			`[UsersApi] getUserData calling ${url} with auth=${maskAuthHeader(
				authorizationHeader
			)}`
		)

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
		if (!response.ok) {
			let bodyText = ''
			try {
				bodyText = await response.text()
			} catch (_) {
				// ignore
			}
			throw new AppError(
				`Users service HTTP ${response.status} - ${bodyText}`,
				502
			)
		}

		const data = await response.json()

		return UserPrivateProfileSchema.parse(data)
	}
}
