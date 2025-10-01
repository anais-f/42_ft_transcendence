import fetch from 'node-fetch';
import type {
  User,
  UserStatus,
  UserConnection,
  UserAvatar,
  UserId,
} from '../models/Users.js'
import { UsersRepository } from '../repositories/usersRepository.js';


export class UsersServicesRequests {
  static existsById(user: UserId): boolean {
    return UsersRepository.existsById(user);
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