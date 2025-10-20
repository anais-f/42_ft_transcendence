import fetch from 'node-fetch'
import {
	PublicUserListDTO,
	PublicUserListAuthSchema,
	PublicUserAuthSchema,
	AppError,
	IUserId
} from '@ft_transcendence/common'

// TODO: update password and username via auth service
// TODO: error handling with try/catch and custom errors

export class AuthApi {
	/**
	 * @description Fetch all users from the auth service
	 * @returns Array of users with user_id and username
	 * @throws Error if the request fails
	 */
	static async getAllUsers() {
		const response = await fetch('http://auth:3000/users')
		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
		const raw = (await response.json()) as PublicUserListDTO
		const parsed = PublicUserListAuthSchema.safeParse(raw)
		if (!parsed.success)
			throw new AppError(
				'Invalid response shape from auth service: ' + parsed.error.message,
				500
			)

		return parsed.data.users.map((u) => ({ user_id: u.user_id }))
	}

	/**
	 * @description Fetch username by user ID from the auth service
	 * @returns UsernameDTO
	 * @throws Error if the request fails
	 * @param id The ID of the user to fetch the username for
	 */
	// static async getUsernameById(id: IUserId): Promise<string> {
	// 	const response = await fetch(`http://auth:3000/users/${id.user_id}`)
	// 	if (!response.ok)
	// 		throw new AppError(`HTTP error! status: ${response.status}`, 500)
  //
	// 	const raw = await response.json().catch(() => {
	// 		throw new AppError('Invalid JSON from auth service', 500)
	// 	})
  //
	// 	const parsed = PublicUserAuthSchema.safeParse(raw)
	// 	if (!parsed.success) {
	// 		console.error(
	// 			'Invalid username response shape from auth service:',
	// 			parsed.error
	// 		)
	// 		throw new AppError('Invalid response shape from auth service', 500)
	// 	}
  //
	// 	return parsed.data.login
	// }
}
