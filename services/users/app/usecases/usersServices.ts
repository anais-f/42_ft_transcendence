import { UsersRepository } from '../repositories/usersRepository.js'
import { AuthApi } from './AuthApi.js'
import {
	IUserId,
	IUserUA,
	IFullUserProfile,
	IUserStatus,
	IUserConnection,
	IUserAvatar,
	AppError,
	ERROR_MESSAGES
} from '@ft_transcendence/common'

export class UsersServices {
	/**
	 * @description Create a new user if not exists when receiving an event from Auth service
	 * @param newUser
	 * @throws Error if user already exists
	 * @returns void
	 */
	static async createUser(newUser: IUserId): Promise<void> {
		if (UsersRepository.existsById({ id_user: newUser.id_user }))
			throw new AppError(ERROR_MESSAGES.USER_ALREADY_EXISTS, 400)

		await UsersRepository.insertUser({ id_user: newUser.id_user })
		console.log(`User ${newUser.id_user} created`)
	}

	/**
	 * @description Sync all users from Auth service to local database
	 * @returns void
	 */
	static async syncAllUsersFromAuth(): Promise<void> {
		const authUsers = await AuthApi.getAllUsers()

		for (const authUser of authUsers) {
			if (!UsersRepository.existsById({ id_user: authUser.id_user }))
				UsersRepository.insertUser({ id_user: authUser.id_user })
		}
	}

	/**
	 * @description Get user profile by id with enrichissement from Auth service
	 * @returns UserProfileDTO
	 * @throws Error if user not found
	 * @param user userId
	 */
	static async getUserProfile(user: IUserId): Promise<IFullUserProfile> {
		if (!user?.id_user || user.id_user <= 0)
			throw new AppError(ERROR_MESSAGES.INVALID_USER_ID, 400)

		const localUser = UsersRepository.getUserById({ id_user: user.id_user })
		if (!localUser) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404)

		const username = await AuthApi.getUsernameById({ id_user: user.id_user })
		return {
			id_user: localUser.id_user,
			username,
			avatar: localUser.avatar,
			status: localUser.status,
			last_connection: localUser.last_connection
		}
	}
}

/*
  Wrapper of UsersRepository
  Can add business usecases if needed
*/
export class UsersServicesRequests {
	static existsById(user: IUserId): boolean {
		return UsersRepository.existsById(user)
	}

	// INSERT methods
	static insertUser(user: IUserId): void {
		UsersRepository.insertUser(user)
	}

	// SET / UPDATE methods
	static updateUserStatus(user: IUserStatus): void {
		UsersRepository.updateUserStatus(user)
	}

	static updateLastConnection(user: IUserConnection): void {
		UsersRepository.updateLastConnection(user)
	}

	static setUserAvatar(user: IUserAvatar): void {
		UsersRepository.updateUserAvatar(user)
	}

	// GET methods
	static getUserById(user: IUserId): IUserUA | undefined {
		return UsersRepository.getUserById(user)
	}

	static getAllUsers(): IUserUA[] {
		return UsersRepository.getAllUsers()
	}

	static getOnlineUsers(): IUserUA[] {
		return UsersRepository.getOnlineUsers()
	}

	static getStatusById(user: IUserId): number {
		return UsersRepository.getStatusById(user)
	}

	static getAvatarById(user: IUserId): string {
		return UsersRepository.getAvatarById(user)
	}

	static getLastConnectionById(user: IUserId): string {
		return UsersRepository.getLastConnectionById(user)
	}

	// DELETE methods
	static deleteUserById(user: IUserId): void {
		UsersRepository.deleteUserById(user)
	}
}
