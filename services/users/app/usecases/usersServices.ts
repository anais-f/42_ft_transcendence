import { UsersRepository } from '../repositories/usersRepository.js'
import { AuthApi } from './AuthApi.js'
import {
	IUserId,
	AppError,
	PublicUserAuthDTO,
	UserPublicProfileDTO,
	UserPrivateProfileDTO,
	ERROR_MESSAGES
} from '@ft_transcendence/common'

export class UsersServices {
	static async createUser(newUser: PublicUserAuthDTO): Promise<void> {
		if (UsersRepository.existsById({ user_id: newUser.user_id }))
			throw new AppError(ERROR_MESSAGES.USER_ALREADY_EXISTS, 400)

		await UsersRepository.insertUser({
			user_id: newUser.user_id,
			login: newUser.login
		})
		console.log(`User ${newUser.user_id} ${newUser.login} created`)
	}

	static async syncAllUsersFromAuth(): Promise<void> {
		const authUsers = await AuthApi.getAllUsers()

		for (const authUser of authUsers) {
			if (!UsersRepository.existsById({ user_id: authUser.user_id }))
				await UsersRepository.insertUser({
					user_id: authUser.user_id,
					login: authUser.login
				})
		}
	}

	static async getPublicUserProfile(
		user: IUserId
	): Promise<UserPublicProfileDTO> {
		if (!user?.user_id || user.user_id <= 0)
			throw new AppError(ERROR_MESSAGES.INVALID_USER_ID, 400)

		const localUser = await UsersRepository.getUserById({
			user_id: user.user_id
		})
		if (!localUser) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404)

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
			throw new AppError(ERROR_MESSAGES.INVALID_USER_ID, 400)

		const localUser = await UsersRepository.getUserById({
			user_id: user.user_id
		})
		if (!localUser) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404)

		return {
			user_id: localUser.user_id,
			username: localUser.username,
			avatar: localUser.avatar,
			status: localUser.status,
			last_connection: localUser.last_connection
		}
	}
}
