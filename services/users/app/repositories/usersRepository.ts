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
	UserSearchResultDTO,
	UserStatus
} from '@ft_transcendence/common'
import createHttpError from 'http-errors'

const defaultAvatar: string = '/avatars/img_default.png'

export class UsersRepository {
	static existsById(user: IUserId): boolean {
		const selectStmt = db.prepare('SELECT 1 FROM users WHERE user_id = ?')
		const row = selectStmt.get(user.user_id)
		return !!row
	}

	static existsByUsername(username: IUsername): boolean {
		const selectStmt = db.prepare('SELECT 1 FROM users WHERE username = ? ')
		const row = selectStmt.get(username.username)
		return !!row
	}

	/**
	 * Generates a unique username by appending incrementing numbers.
	 *
	 * Algorithm:
	 * - First tries base username as-is
	 * - Then tries username1, username2, username3...
	 * - Stops at 10000 attempts or if length exceeds 32 chars
	 *
	 * Examples:
	 * - "john" exists → returns "john1"
	 * - "john", "john1", "john2" exist → returns "john3"
	 *
	 * @throws {UnprocessableEntity} If cannot generate unique username within limits
	 */
	private static generateUniqueUsername(baseUsername: string): string {
		let username = baseUsername
		let counter = 1

		while (this.existsByUsername({ username })) {
			username = `${baseUsername}${counter}`
			counter++

			if (counter > 10000 || username.length > 32) {
				throw createHttpError.UnprocessableEntity(
					'Unable to generate unique username'
				)
			}
		}

		return username
	}

	/**
	 * Creates a new user with auto-generated unique username.
	 *
	 * IMPORTANT: Uses INSERT OR IGNORE - silently skips if user_id exists.
	 * Username is generated from login by appending numbers if needed.
	 *
	 * @param user - Must contain user_id and login from auth service
	 */
	static insertUser(user: IPublicUserAuth): void {
		const uniqueUsername = this.generateUniqueUsername(user.login)

		const insertStmt = db.prepare(
			'INSERT OR IGNORE INTO users (user_id, username, avatar, status, last_connection) VALUES (?, ?, ?, ?, ?)'
		)
		const now = new Date().toISOString()
		insertStmt.run(
			user.user_id,
			uniqueUsername,
			defaultAvatar,
			UserStatus.OFFLINE,
			now
		)
	}

	static updateUserAvatar(user: IUserAvatar): void {
		const updateStmt = db.prepare(
			'UPDATE users SET avatar = ? WHERE user_id = ?'
		)
		updateStmt.run(user.avatar, user.user_id)
	}

	static updateUsername(user: IUsernameId): void {
		const updateStmt = db.prepare(
			'UPDATE users SET username = ? WHERE user_id = ?'
		)
		let info
		try {
			info = updateStmt.run(user.username, user.user_id)
		} catch (error: unknown) {
			if (
				typeof error === 'object' &&
				error !== null &&
				'code' in error &&
				error.code === 'SQLITE_CONSTRAINT_UNIQUE'
			) {
				throw createHttpError.Conflict('Username already taken')
			}
			throw error
		}

		if (info.changes === 0) throw createHttpError.NotFound('User not found')
	}

	static updateUserStatus(
		user: IUserId,
		status: UserStatus,
		lastConnection?: string
	): void {
		if (status === UserStatus.OFFLINE && lastConnection) {
			const updateStmt = db.prepare(
				'UPDATE users SET status = ?, last_connection = ? WHERE user_id = ?'
			)
			const info = updateStmt.run(status, lastConnection, user.user_id)
			if (info.changes === 0) {
				throw createHttpError.NotFound('User not found')
			}
		} else {
			const updateStmt = db.prepare(
				'UPDATE users SET status = ?  WHERE user_id = ?'
			)
			const info = updateStmt.run(status, user.user_id)
			if (info.changes === 0) throw createHttpError.NotFound('User not found')
		}
	}

	static getUserById(user: IUserId): UserPublicProfileDTO | undefined {
		const selectStmt = db.prepare(
			'SELECT user_id, username, avatar, status, last_connection FROM users WHERE user_id = ? '
		)
		return selectStmt.get(user.user_id) as UserPublicProfileDTO | undefined
	}

	static getUserStatusById(user: IUserId): UserStatus | undefined {
		const selectStmt = db.prepare('SELECT status FROM users WHERE user_id = ?')
		const row = selectStmt.get(user.user_id) as { status: number } | undefined
		return row?.status as UserStatus | undefined
	}

	static getAllUsers(): IPrivateUser[] {
		const selectStmt = db.prepare(
			'SELECT user_id, username, avatar, status, last_connection FROM users'
		)
		return selectStmt.all() as IPrivateUser[]
	}

	static deleteUserById(user: IUserId): void {
		const deleteStmt = db.prepare('DELETE FROM users WHERE user_id = ?')
		deleteStmt.run(user.user_id)
	}

	static searchByExactUsername(
		username: IUsername
	): UserSearchResultDTO | null {
		const selectStmt = db.prepare(
			'SELECT user_id, username, avatar FROM users WHERE username = ?'
		)
		const row = selectStmt.get(username.username) as
			| UserSearchResultDTO
			| undefined
		return row || null
	}

	static getTotalUsersCount(): number {
		const selectStmt = db.prepare('SELECT COUNT(*) as count FROM users')
		const row = selectStmt.get() as { count: number }
		return row.count
	}
}
