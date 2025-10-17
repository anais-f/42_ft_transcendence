import { db } from '../database/usersDatabase.js'
import {
	IUserId,
	IUserStatus,
	IUserConnection,
	IUserAvatar,
	IUserUA
} from '@ft_transcendence/common'

// const defaultAvatar: string = '../img.png' // default avatar path
const defaultAvatar: string = '/avatars/img_default.png'

/**
 * @description Repository for users table
 * @class UsersRepository
 */
export class UsersRepository {
	/**
	 * @description Check if a user exists by id
	 * @param user - The id of the user to check
	 * @returns A Result indicating whether the user exists or an error occurred
	 */
	static existsById(user: IUserId): boolean {
		const selectStmt = db.prepare('SELECT 1 FROM users WHERE id_user = ?')
		const row = selectStmt.get(user.id_user)
		return !!row
	}

	/**
	 * @description Insert a new user with default values
	 * @param user - The id of the user to insert
	 * @returns A Result indicating success or an error occurred
	 */
	static insertUser(user: IUserId): void {
		const insertStmt = db.prepare(
			'INSERT OR IGNORE INTO users (id_user, avatar, status, last_connection) VALUES (?, ?, ?, ?)'
		)
		const now = new Date().toISOString()
		insertStmt.run(user.id_user, defaultAvatar, 1, now)
	}

	/**
	 * @description Update methods for user status, last connection or avatar
	 */
	static updateUserStatus(user: IUserStatus): void {
		const updateStmt = db.prepare(
			'UPDATE users SET status = ? WHERE id_user = ?'
		)
		updateStmt.run(user.status, user.id_user)
	}

	static updateLastConnection(user: IUserConnection): void {
		const updateStmt = db.prepare(
			'UPDATE users SET last_connection = ? WHERE id_user = ?'
		)
		const now = new Date().toISOString()
		updateStmt.run(now, user.id_user)
	}

	static updateUserAvatar(user: IUserAvatar): void {
		const updateStmt = db.prepare(
			'UPDATE users SET avatar = ? WHERE id_user = ?'
		)
		updateStmt.run(user.avatar, user.id_user)
	}

	/**
	 * @description Some get methods according to the table fields
	 */
	static getUserById(user: IUserId): IUserUA | undefined {
		const selectStmt = db.prepare(
			'SELECT id_user, avatar, status, last_connection FROM users WHERE id_user = ?'
		)
		return selectStmt.get(user.id_user) as IUserUA | undefined
	}

	static getStatusById(user: IUserId): number {
		const selectStmt = db.prepare('SELECT status FROM users WHERE id_user = ?')
		const row = selectStmt.get(user.id_user) as { status: number }
		return row.status
	}

	static getLastConnectionById(user: IUserId): string {
		const selectStmt = db.prepare(
			'SELECT last_connection FROM users WHERE id_user = ?'
		)
		const row = selectStmt.get(user.id_user) as { last_connection: string }
		return row.last_connection
	}

	static getAvatarById(user: IUserId): string {
		const selectStmt = db.prepare('SELECT avatar FROM users WHERE id_user = ?')
		const row = selectStmt.get(user.id_user) as { avatar: string }
		return row.avatar
	}

	/**
	 * @description Get all users or users according to their status
	 */
	static getAllUsers(): IUserUA[] {
		const selectStmt = db.prepare(
			'SELECT id_user, avatar, status, last_connection FROM users'
		)
		return selectStmt.all() as IUserUA[]
	}

	static getOnlineUsers(): IUserUA[] {
		const selectStmt = db.prepare(
			'SELECT id_user, avatar, status, last_connection FROM users WHERE status = 1'
		)
		return selectStmt.all() as IUserUA[]
	}

	/**
	 * @description Delete user by id
	 */
	static deleteUserById(user: IUserId): void {
		const deleteStmt = db.prepare('DELETE FROM users WHERE id_user = ?')
		deleteStmt.run(user.id_user)
	}
}

// static insertManyUsers(users: UserId[]) {
//   const insertStmt = db.prepare(
//       'INSERT OR IGNORE INTO users (id_user, avatar, status, last_connection) VALUES (?, ?, ?, ?)'
//   )
//   const now = new Date().toISOString()
//   const insertMany = db.transaction((usersList: UserId[]) => {
//     for (const user of usersList) {
//       insertStmt.run(user.id_user, defaultAvatar, 1, now)
//     }
//   })
//   insertMany(users)
// }
