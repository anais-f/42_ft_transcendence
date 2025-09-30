// logique métier
/*
    Contiennent la logique métier, les règles métier.
    Appellent les repositories pour la persistence.
    Peuvent appeler d’autres services ou API externes (ex: webhook).
    Ex: UserService.createUser(), UserService.importUsersFromAuth().
 */

import fetch from 'node-fetch';
import type {
  User,
  UserStatus,
  UserConnection,
  UserAvatar,
  UserId,
} from '../models/Users.js'
import { UsersRepository } from '../repositories/UsersRepository.js';


// pour la recup des donnees de auth, a voir
export async function fetchUsersFromAuth() {
  try {
    const response = await fetch('http://auth:3000/auth/users');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // data contient un objet avec la structure attendue { users: [ { id_user: number, username: string } ] }
    // .json est une methode qui lit le corps de la reponse et le parse en JSON, pas de verif de la part de la fonction
    const data = await response.json();

    // Appel au repository pour insérer les utilisateurs en base
    await UsersRepository.insertManyUsers(data.users);
  }
  catch (error) {
    console.error('Error fetching users from auth service:', error);
  }
}

export class UserServices {
  static userExists(user: UserId): boolean {
    return UsersRepository.userExists(user);
  }

  // INSERT methods
  static insertManyUsers(users: UserId[]) {
    UsersRepository.insertManyUsers(users);
  }

  static insertUser(user: UserId) {
    UsersRepository.insertUser(user);
  }

  // SET / UPDATE methods
  static setUserStatus(user: UserStatus) {
    UsersRepository.setUserStatus(user);
  }

  static setLastConnection(user: UserConnection) {
    UsersRepository.setLastConnection(user);
  }

  static setUserAvatar(user: UserAvatar) {
    UsersRepository.setUserAvatar(user);
  }

  // GET methods
  static getUserById(user: UserId): User | undefined {
    return UsersRepository.getUserById(user);
  }

  static async getAllUsers(): User[] {
    return UsersRepository.getAllUsers();
  }

  static getOnlineUsers(): User[] {
    return UsersRepository.getOnlineUsers();
  }

  static getStatusById(user: UserId): UserStatus {
    return UsersRepository.getStatusById(user);
  }

  static getAvatarById(user: UserId): UserAvatar {
    return UsersRepository.getAvatarById(user);
  }

  static getLastConnectionById(user: UserId): UserConnection {
    return UsersRepository.getLastConnectionById(user);
  }
}