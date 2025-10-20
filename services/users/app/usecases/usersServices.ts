import { UsersRepository } from '../repositories/usersRepository.js'
import { AuthApi } from './AuthApi.js'
import {
	IUserId,
	AppError,
	PublicUserAuthDTO,
	UserPublicProfileDTO,
	UserPublicProfileSchema,
	ERROR_MESSAGES
} from '@ft_transcendence/common'

export class UsersServices {
	/**
	 * @description Create a new user if not exists when receiving an event from Auth service
	 * @param newUser
	 * @throws Error if user already exists
	 * @returns void
	 */
	static async createUser(newUser: PublicUserAuthDTO): Promise<void> {
		if (UsersRepository.existsById({ user_id: newUser.user_id }))
			throw new AppError(ERROR_MESSAGES.USER_ALREADY_EXISTS, 400)

		await UsersRepository.insertUser({
			user_id: newUser.user_id,
			login: newUser.login
		})
		console.log(`User ${newUser.user_id} ${newUser.login} created`)
	}

	/**
	 * @description Sync all users from Auth service to local database
	 * @returns void
	 */
	static async syncAllUsersFromAuth(): Promise<void> {
		const authUsers = await AuthApi.getAllUsers()

		for (const authUser of authUsers) {
			if (!UsersRepository.existsById({ user_id: authUser.user_id }))
				UsersRepository.insertUser({
					user_id: authUser.user_id,
					login: authUser.login
				})
		}
	}

	/**
	 * @description Get user profile by id with enrichissement from Auth service
	 * @returns UserProfileDTO
	 * @throws Error if user not found
	 * @param user userId
	 */
	static async getPublicUserProfile(
		user: IUserId
	): Promise<UserPublicProfileDTO> {
		if (!user?.user_id || user.user_id <= 0)
			throw new AppError(ERROR_MESSAGES.INVALID_USER_ID, 400)

		const localUser = UsersRepository.getUserById({ user_id: user.user_id })
		if (!localUser) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404)

		return {
			user_id: localUser.user_id,
			username: localUser.username,
			avatar: localUser.avatar,
			status: localUser.status,
			last_connection: localUser.last_connection
		}
	}

	// static async getPrivateUserProfile
}
