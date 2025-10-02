import type {
	User,
	UserStatus,
	UserConnection,
	UserAvatar,
	UserId,
} from '../models/Users.js'
import { UsersRepository } from '../repositories/usersRepository.js'
import { ERROR_MESSAGES, SUCCESS_MESSAGES} from "../utils/utils.js";
import {NewUserDTO} from "../models/UsersDTO.js";
import {AuthApi} from "./internalApi/AuthApi.js";


export class UsersService {
  /**
   * @description Create a new user if not exists
   * @param newUser
   * @throws Error if user already exists
   * @returns void
   */
  static async createUser(newUser: NewUserDTO) {
    if (UsersRepository.existsById({id_user: newUser.id_user}))
      throw new Error(ERROR_MESSAGES.USER_ALREADY_EXISTS)

    UsersRepository.insertUser({ id_user: newUser.id_user })
    console.log(`User ${newUser.id_user} created`)
  }

  // create many users avec le tableau d'id ?




  // // ✅ Logique métier pour webhook
  // static async createUserFromWebhook(userData: NewUserDTO): Promise<void> {
  //   const { id_user } = userData;
  //
  //   if (UsersRepository.existsById({ id_user })) {
  //     throw new Error('User already exists');
  //   }
  //
  //   UsersRepository.insertUser({ id_user });
  //   console.log(`User ${id_user} created via webhook`);
  // }
  //
  // // ✅ Logique métier pour sync périodique
  // static async syncAllUsersFromAuth(): Promise<void> {
  //   const authUsers = await AuthApi.getAllUsers();
  //
  //   for (const authUser of authUsers) {
  //     if (!UsersRepository.existsById({ id_user: authUser.id_user })) {
  //       UsersRepository.insertUser({ id_user: authUser.id_user });
  //     }
  //   }
  // }
  //
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
  Can add business logic if needed
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
	static setUserStatus(user: UserStatus): void {
		UsersRepository.updateUserStatus(user)
	}

	static setLastConnection(user: UserConnection): void {
		UsersRepository.setLastConnection(user)
	}

	static setUserAvatar(user: UserAvatar): void {
		UsersRepository.updateUserAvatar(user)
	}

	// GET methods
	static getUserById(user: UserId): User | undefined {
		return UsersRepository.getUserById(user)
	}

	static async getAllUsers(): User[] {
		return UsersRepository.getAllUsers()
	}

	static getOnlineUsers(): User[] {
		return UsersRepository.getOnlineUsers()
	}

	static getStatusById(user: UserId): UserStatus {
		return UsersRepository.getStatusById(user)
	}

	static getAvatarById(user: UserId): UserAvatar {
		return UsersRepository.getAvatarById(user)
	}

	static getLastConnectionById(user: UserId): UserConnection {
		return UsersRepository.getLastConnectionById(user)
	}

  // DELETE methods
  static deleteUserById(user: UserId): void {
    UsersRepository.deleteUserById(user)
  }
}
