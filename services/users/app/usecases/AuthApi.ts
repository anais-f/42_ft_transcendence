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
		const response = await fetch('http://auth:3000/api/users')
		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
		const raw = (await response.json()) as PublicUserListAuthDTO
		const parsed = PublicUserListAuthSchema.safeParse(raw)
		if (!parsed.success)
			throw new AppError(
				'Invalid response shape from auth service: ' + parsed.error.message,
				500
			)

		return parsed.data.users
	}
}
