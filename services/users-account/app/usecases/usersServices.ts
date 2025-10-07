import type {
	User,
	UserStatus,
	UserConnection,
	UserAvatar,
	UserId,
} from '../models/Users.js'
import { UsersRepository } from '../repositories/usersRepository.js'
import { ERROR_MESSAGES } from '../utils/utils.js'
import { AuthApi } from './internalApi/AuthApi.js'
import {UserProfileDTO} from "@services/users-account/app/models/UsersDTO.js";

export class UsersServices {
	/**
	 * @description Create a new user if not exists when receiving an event from Auth service
	 * @param newUser
	 * @throws Error if user already exists
	 * @returns void
	 */
	static async createUser(newUser: UserId): Promise<void> {
		if (UsersRepository.existsById({ id_user: newUser.id_user }))
			throw new Error(ERROR_MESSAGES.USER_ALREADY_EXISTS)

		UsersRepository.insertUser({ id_user: newUser.id_user })
		console.log(`User ${newUser.id_user} created`)
	}

  /**
   * @description Sync all users from Auth service to local database
   * @returns void
   */
	static async syncAllUsersFromAuth(): Promise<void> {
		const authUsers = await AuthApi.getAllUsers()

		for (const authUser of authUsers) {
			if (!UsersRepository.existsById({ id_user: authUser.id_user })) {
				UsersRepository.insertUser({ id_user: authUser.id_user })
			}
		}
	}

  /**
   * @description Get user profile by id with enrichissement from Auth service
   * @returns UserProfileDTO
   * @throws Error if user not found
   * @param userId
   */
  static async getUserProfile(user: UserId): Promise<UserProfileDTO> {
    const localUser = UsersRepository.getUserById({ id_user: user.id_user });
    if (!localUser) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);

    const username = await AuthApi.getUsernameById({ id_user: user.id_user });
    return {
      id_user: localUser.id_user,
      username,
      avatar: localUser.avatar,
      status: localUser.status,
      last_connection: localUser.last_connection
    };
  }



	// // ✅ Récupération avec enrichissement
	// static async getUserWithProfile(id_user: number): Promise<UserWithProfile> {
	//   const localUser = UsersRepository.getUserById({ id_user });
	//   if (!localUser) throw new Error('User not found');
	//
	//   // Enrichir avec data du service auth si nécessaire
	//   const username = await AuthApi.getUsernameById(id_user);
	//
	//   return {
	//     ...localUser,
	//     username
	//   };
	// }
}

/*
  Wrapper of UsersRepository
  Can add business usecases if needed
*/
export class UsersServicesRequests {
	static existsById(user: UserId): boolean {
		return UsersRepository.existsById(user)
	}

	// INSERT methods
	static insertManyUsers(users: UserId[]): void {
		UsersRepository.insertManyUsers(users)
	}

	static insertUser(user: UserId): void {
		UsersRepository.insertUser(user)
	}

	// SET / UPDATE methods
	static updateUserStatus(user: UserStatus): void {
		UsersRepository.updateUserStatus(user)
	}

	static updateLastConnection(user: UserConnection): void {
		UsersRepository.updateLastConnection(user)
	}

	static setUserAvatar(user: UserAvatar): void {
		UsersRepository.updateUserAvatar(user)
	}

	// GET methods
	static getUserById(user: UserId): User | undefined {
		return UsersRepository.getUserById(user)
	}

	static getAllUsers(): User[] {
		return UsersRepository.getAllUsers()
	}

	static getOnlineUsers(): User[] {
		return UsersRepository.getOnlineUsers()
	}

	static getStatusById(user: UserId): number {
		return UsersRepository.getStatusById(user)
	}

	static getAvatarById(user: UserId): string {
		return UsersRepository.getAvatarById(user)
	}

	static getLastConnectionById(user: UserId): string {
		return UsersRepository.getLastConnectionById(user)
	}

	// DELETE methods
	static deleteUserById(user: UserId): void {
		UsersRepository.deleteUserById(user)
	}
}
