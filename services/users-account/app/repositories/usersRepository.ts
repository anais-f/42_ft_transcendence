import { db } from '../database/usersDatabase.js'
import type {
	User,
	UserStatus,
	UserConnection,
	UserAvatar,
	UserId,
} from '../models/Users.js'

// TODO: changer l'adresse de l'avatar par defaut
// TODO: pouvoir changer le username -> call avec l'auth pour la modif -> internalApi
// TODO: get username (from auth service) -> internalApi
// TODO: get all users avec le username (from auth service) -> internalApi partiellement

const defaultAvatar: string = '../img.png' // default avatar path

/**
 * @description Repository for users table
 * @class UsersRepository
 */
export class UsersRepository {
  /**
   * @description Check if a user exists by id
   * @param user
   */
	static existsById(user: UserId): boolean {
		const selectStmt = db.prepare('SELECT 1 FROM users WHERE id_user = ?')
		const row = selectStmt.get(user.id_user)
		return !!row
	}

  /**
   * @description Insert many or one user with default values for avatar, status and last_connection
   */
	static insertManyUsers(users: UserId[]) {
		const insertStmt = db.prepare(
			'INSERT OR IGNORE INTO users (id_user, avatar, status, last_connection) VALUES (?, ?, ?, ?)'
		)
		const now = new Date().toISOString()
		const insertMany = db.transaction((usersList: UserId[]) => {
			for (const user of usersList) {
				insertStmt.run(user.id_user, defaultAvatar, 1, now)
			}
		})
		insertMany(users)
	}

	static insertUser(user: UserId) {
		const insertStmt = db.prepare(
			'INSERT OR IGNORE INTO users (id_user, avatar, status, last_connection) VALUES (?, ?, ?, ?)'
		)
		const now = new Date().toISOString()
		insertStmt.run(user.id_user, defaultAvatar, 1, now)
	}

  /**
   * @description Update methods for user status, last connection or avatar
   */
	static updateUserStatus(user: UserStatus) {
		const updateStmt = db.prepare(
			'UPDATE users SET status = ? WHERE id_user = ?'
		)
		updateStmt.run(user.status, user.id_user)
	}

	static updateLastConnection(user: UserConnection) {
		const updateStmt = db.prepare(
			'UPDATE users SET last_connection = ? WHERE id_user = ?'
		)
		const now = new Date().toISOString()
		updateStmt.run(now, user.id_user)
	}

	static updateUserAvatar(user: UserAvatar) {
		const updateStmt = db.prepare(
			'UPDATE users SET avatar = ? WHERE id_user = ?'
		)
		updateStmt.run(user.avatar, user.id_user)
	}

  /**
   * @description Some get methods according to the table fields
   */
	static getUserById(user: UserId) {
		const selectStmt = db.prepare(
			'SELECT id_user, avatar, status, last_connection FROM users WHERE id_user = ?'
		)
		return selectStmt.get(user.id_user)
	}

	static getStatusById(user: UserStatus): number {
		const selectStmt = db.prepare('SELECT status FROM users WHERE id_user = ?')
		const row = selectStmt.get(user.id_user) as { status: number }
		return row.status
	}

	static getLastConnectionById(user: UserConnection): string {
		const selectStmt = db.prepare(
			'SELECT last_connection FROM users WHERE id_user = ?'
		)
		const row = selectStmt.get(user.id_user) as { last_connection: string }
		return row.last_connection
	}

	static getAvatarById(user: UserAvatar): string {
		const selectStmt = db.prepare('SELECT avatar FROM users WHERE id_user = ?')
		const row = selectStmt.get(user.id_user) as { avatar: string }
		return row.avatar
	}

  /**
   * @description Get all users or users according to their status
   */
	static getAllUsers(): User[] {
		const selectStmt = db.prepare(
			'SELECT id_user, avatar, status, last_connection FROM users'
		)
		return selectStmt.all() as User[]
	}

	static getOnlineUsers(): User[] {
		const selectStmt = db.prepare(
			'SELECT id_user, avatar, status, last_connection FROM users WHERE status = 1'
		)
		return selectStmt.all() as User[]
	}

  /**
   * @description Delete user by id
   */
  static deleteUserById(user: UserId) {
    const deleteStmt = db.prepare('DELETE FROM users WHERE id_user = ?')
    deleteStmt.run(user.id_user)
  }
}
