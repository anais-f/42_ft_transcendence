import { db } from '../database/usersDatabase.js'
import {
	IUserId,
	IUsernameId,
	IUsername,
	IUserConnection,
	IUserAvatar,
	IPrivateUser,
	IPublicUserAuth,
	UserPublicProfileDTO,
	ERROR_MESSAGES,
	AppError
} from '@ft_transcendence/common'

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
		const selectStmt = db.prepare('SELECT 1 FROM users WHERE user_id = ?')
		const row = selectStmt.get(user.user_id)
		return !!row
	}

	static existsByUsername(username: IUsername): boolean {
		const selectStmt = db.prepare('SELECT 1 FROM users WHERE username = ?')
		const row = selectStmt.get(username.username)
		return !!row
	}

	/**
	 * @description Generate a unique username by incrementing if necessary
	 * @param baseUsername - The base username (login) to check
	 * @returns A unique username
	 */
	private static generateUniqueUsername(baseUsername: string): string {
		if (!this.existsByUsername({ username: baseUsername })) {
			return baseUsername
		}

		let counter = 1
		let candidateUsername = `${baseUsername}${counter}`

		while (this.existsByUsername({ username: candidateUsername })) {
			counter++
			candidateUsername = `${baseUsername}${counter}`

			if (counter > 10000) {
				throw new AppError('Unable to generate unique username', 500)
			}
		}

		return candidateUsername
	}

	/**
	 * @description Insert a new user with default values
	 * @param user - The id of the user to insert
	 * @returns A Result indicating success or an error occurred
	 */
	static insertUser(user: IPublicUserAuth): void {
		const uniqueUsername = this.generateUniqueUsername(user.login)

		const insertStmt = db.prepare(
			'INSERT OR IGNORE INTO users (user_id, username, avatar, status, last_connection) VALUES (?, ?, ?, ?, ?)'
		)
		const now = new Date().toISOString()
		insertStmt.run(user.user_id, uniqueUsername, defaultAvatar, 1, now)
	}

	/**
	 * @description Update methods for last connection, status, username or avatars
	 */

	static updateLastConnection(user: IUserConnection): void {
		const updateStmt = db.prepare(
			'UPDATE users SET last_connection = ? WHERE user_id = ?'
		)
		const now = new Date().toISOString()
		updateStmt.run(now, user.user_id)
	}

	static updateUserAvatar(user: IUserAvatar): void {
		const updateStmt = db.prepare(
			'UPDATE users SET avatar = ? WHERE user_id = ?'
		)
		updateStmt.run(user.avatar, user.user_id)
	}

	static updateUsername(user: IUsernameId): void {
		try {
			const updateStmt = db.prepare(
				'UPDATE users SET username = ? WHERE user_id = ?'
			)
			const info = updateStmt.run(user.username, user.user_id)
			if (info.changes === 0) {
				throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404)
			}
		} catch (error: any) {
			if (
				error?.code === 'SQLITE_CONSTRAINT' ||
				error?.message?.includes('UNIQUE constraint failed')
			) {
				throw new AppError(ERROR_MESSAGES.USERNAME_ALREADY_TAKEN, 409)
			}
			throw error
		}
	}

	static updateUserStatus(user: IUserConnection, status: number): void {
		const updateStmt = db.prepare(
			'UPDATE users SET status = ? WHERE user_id = ?'
		)
		updateStmt.run(status, user.user_id)
	}

	/**
	 * @description Some get methods according to the table fields
	 */
	static getUserById(user: IUserId): UserPublicProfileDTO | undefined {
		const selectStmt = db.prepare(
			'SELECT user_id, username, avatar, status, last_connection FROM users WHERE user_id = ?'
		)
		return selectStmt.get(user.user_id) as UserPublicProfileDTO | undefined
	}

	static getUserByUsername(username: IUsername): IPrivateUser | undefined {
		const selectStmt = db.prepare(
			'SELECT user_id, username, avatar, status, last_connection FROM users WHERE username = ?'
		)
		return selectStmt.get(username) as IPrivateUser | undefined
	}

	static getLastConnectionById(user: IUserId): string {
		const selectStmt = db.prepare(
			'SELECT last_connection FROM users WHERE user_id = ?'
		)
		const row = selectStmt.get(user.user_id) as { last_connection: string }
		return row.last_connection
	}

	static getAvatarById(user: IUserId): string {
		const selectStmt = db.prepare('SELECT avatar FROM users WHERE user_id = ?')
		const row = selectStmt.get(user.user_id) as { avatar: string }
		return row.avatar
	}

	/**
	 * @description Get all users or users according to their status
	 */
	static getAllUsers(): IPrivateUser[] {
		const selectStmt = db.prepare(
			'SELECT user_id, username, avatar, status, last_connection FROM users'
		)
		return selectStmt.all() as IPrivateUser[]
	}

	/**
	 * @description Delete user by id
	 */
	static deleteUserById(user: IUserId): void {
		const deleteStmt = db.prepare('DELETE FROM users WHERE user_id = ?')
		deleteStmt.run(user.user_id)
	}
}
