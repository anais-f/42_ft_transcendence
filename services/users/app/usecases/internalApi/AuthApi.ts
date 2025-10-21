import fetch from 'node-fetch'
import {
	UserAuthSchema,
	PublicUserListDTO,
	PublicUserListSchema
} from '../../models/UsersDTO.js'
import { UserId } from '../../models/Users.js'
import { ENV } from '../../config/env.js'

// TODO: update password and username via auth service
// TODO: error handling with try/catch and custom errors

export class AuthApi {
	/**
	 * @description Fetch all users from the auth service
	 * @returns Array of users with id_user and username
	 * @throws Error if the request fails
	 */
	static async getAllUsers() {
		const response = await fetch(`${ENV.AUTH_API_BASE_URL}/users`)
		console.log('Fetching all users from auth service:', response.url)
		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
		const raw = (await response.json()) as PublicUserListDTO
		const parsed = PublicUserListSchema.safeParse(raw)
		if (!parsed.success)
			throw new Error(
				'Invalid response shape from auth service: ' + parsed.error.message
			)
		return parsed.data.users.map((u) => ({ id_user: u.id_user }))
	}

	/**
	 * @description Fetch username by user ID from the auth service
	 * @returns UsernameDTO
	 * @throws Error if the request fails
	 * @param id The ID of the user to fetch the username for
	 */
	static async getUsernameById(id: UserId): Promise<string> {
		const response = await fetch(`${ENV.AUTH_API_BASE_URL}/users/${id.id_user}`)
		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

		const raw = await response.json().catch(() => {
			throw new Error('Invalid JSON from auth service')
		})

		const parsed = UserAuthSchema.safeParse(raw)
		if (!parsed.success) {
			console.error(
				'Invalid username response shape from auth service:',
				parsed.error
			)
			throw new Error('Invalid response shape from auth service')
		}

		return parsed.data.username
	}
}
