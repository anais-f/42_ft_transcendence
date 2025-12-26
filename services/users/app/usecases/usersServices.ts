import { UsersRepository } from '../repositories/usersRepository.js'
import { AuthApi } from '../repositories/AuthApi.js'
import {
	IUserId,
	PublicUserAuthDTO,
	UserPublicProfileDTO,
	UserPrivateProfileDTO,
	UserSearchResultDTO
} from '@ft_transcendence/common'
import createHttpError from 'http-errors'
import { updateUserMetrics } from './metricsService.js'

export class UsersServices {
	static async createUser(newUser: PublicUserAuthDTO): Promise<void> {
		if (UsersRepository.existsById({ user_id: newUser.user_id })) {
			console.log(`User ${newUser.user_id} already exists, skipping creation`)
			return
		}

		UsersRepository.insertUser({
			user_id: newUser.user_id,
			login: newUser.login
		})
		console.log(`User ${newUser.user_id} ${newUser.login} created`)

		updateUserMetrics()
	}

	static async syncAllUsersFromAuth(): Promise<void> {
		const authUsers = await AuthApi.getAllUsers()

		for (const authUser of authUsers) {
			if (!UsersRepository.existsById({ user_id: authUser.user_id }))
				UsersRepository.insertUser({
					user_id: authUser.user_id,
					login: authUser.login
				})
		}

		updateUserMetrics()
	}

	static async getPublicUserProfile(
		user: IUserId
	): Promise<UserPublicProfileDTO> {
		if (!user.user_id || user.user_id <= 0)
			throw createHttpError.BadRequest('Invalid user ID')

		const localUser = await UsersRepository.getUserById({
			user_id: user.user_id
		})
		if (!localUser) throw createHttpError.NotFound('User not found')

		return {
			user_id: localUser.user_id,
			username: localUser.username,
			avatar: localUser.avatar,
			status: localUser.status,
			last_connection: localUser.last_connection
		}
	}

	static async getPrivateUserProfile(user: {
		user_id: number
	}): Promise<UserPrivateProfileDTO> {
		if (!user.user_id || user.user_id <= 0)
			throw createHttpError.BadRequest('Invalid user ID')

		const localUser = await UsersRepository.getUserById({
			user_id: user.user_id
		})
		if (!localUser) throw createHttpError.NotFound('User not found')

		let two_fa_status = false
		try {
			two_fa_status = await AuthApi.get2FAStatus(user.user_id)
		} catch (err) {
			throw createHttpError.BadGateway(
				'Failed to get 2FA status from auth service'
			)
		}
		console.log(`User ${user.user_id} 2FA status: ${two_fa_status}`)

		return {
			user_id: localUser.user_id,
			username: localUser.username,
			avatar: localUser.avatar,
			status: localUser.status,
			last_connection: localUser.last_connection,
			two_fa_enabled: two_fa_status
		}
	}

	static async searchUserByExactUsername(
		username: string
	): Promise<UserSearchResultDTO> {
		if (!username || username.trim().length === 0)
			throw createHttpError.BadRequest('Username is required')

		const result = UsersRepository.searchByExactUsername({ username })
		if (!result) throw createHttpError.NotFound('User not found')

		return result
	}
}
