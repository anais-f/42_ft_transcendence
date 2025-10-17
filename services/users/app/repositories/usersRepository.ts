import { db } from '../database/usersDatabase.js'
import type {
	IUserUA,
	IUserStatus,
	IUserConnection,
	IUserAvatar,
	IUserId
} from '../../../common/interfaces/usersModels.js'
import { mapSqliteError, ok, err, type Result } from '../../../common/error/errorsMap.js'

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
	static existsById(user: IUserId): Result<boolean> {
		try {
			const selectStmt = db.prepare('SELECT 1 FROM users WHERE id_user = ?')
			const row = selectStmt.get(user.id_user)
			return ok(!!row)
		} catch (e: any) {
			return err(mapSqliteError(e))
		}
	}

	/**
	 * @description Insert a new user with default values
	 * @param user - The id of the user to insert
	 * @returns A Result indicating success or an error occurred
	 */
	static insertUser(user: IUserId): Result<null> {
		try {
			const insertStmt = db.prepare(
				'INSERT OR IGNORE INTO users (id_user, avatar, status, last_connection) VALUES (?, ?, ?, ?)'
			)
			const now = new Date().toISOString()
			insertStmt.run(user.id_user, defaultAvatar, 1, now)
			return ok(null)
		} catch (e: any) {
			return err(mapSqliteError(e))
		}
	}

	/**
	 * @description Update methods for user status, last connection or avatar
	 */
	static updateUserStatus(user: IUserStatus): Result<null> {
		try {
			const updateStmt = db.prepare(
				'UPDATE users SET status = ? WHERE id_user = ?'
			)
			updateStmt.run(user.status, user.id_user)
			return ok(null)
		} catch (e: any) {
			return err(mapSqliteError(e))
		}
	}

	static updateLastConnection(user: IUserConnection): Result<null> {
		try {
			const updateStmt = db.prepare(
				'UPDATE users SET last_connection = ? WHERE id_user = ?'
			)
			const now = new Date().toISOString()
			updateStmt.run(now, user.id_user)
			return ok(null)
		} catch (e: any) {
			return err(mapSqliteError(e))
		}
	}

	static updateUserAvatar(user: IUserAvatar): Result<null> {
		try {
			const updateStmt = db.prepare(
				'UPDATE users SET avatar = ? WHERE id_user = ?'
			)
			updateStmt.run(user.avatar, user.id_user)
			return ok(null)
		} catch (e: any) {
			return err(mapSqliteError(e))
		}
	}

	/**
	 * @description Some get methods according to the table fields
	 */
	static getUserById(user: IUserId): Result<IUserUA | null> {
		try {
			const selectStmt = db.prepare(
				'SELECT id_user, avatar, status, last_connection FROM users WHERE id_user = ?'
			)
			const row = selectStmt.get(user.id_user) as IUserUA | undefined
			if (!row) return err('NOT_FOUND')
			return ok(row as IUserUA)
		} catch (e: any) {
			return err(mapSqliteError(e))
		}
	}

	static getStatusById(user: IUserId): Result<number> {
		try {
			const selectStmt = db.prepare(
				'SELECT status FROM users WHERE id_user = ?'
			)
			const row = selectStmt.get(user.id_user) as { status: number } | undefined
			if (!row) return err('NOT_FOUND')
			return ok(row.status)
		} catch (e: any) {
			return err(mapSqliteError(e))
		}
	}

	static getLastConnectionById(user: IUserId): Result<string> {
		try {
			const selectStmt = db.prepare(
				'SELECT last_connection FROM users WHERE id_user = ?'
			)
			const row = selectStmt.get(user.id_user) as { last_connection: string }
			if (!row) return err('NOT_FOUND')
			return ok(row.last_connection)
		} catch (e: any) {
			return err(mapSqliteError(e))
		}
	}

	static getAvatarById(user: IUserId): Result<string> {
		try {
			const selectStmt = db.prepare(
				'SELECT avatar FROM users WHERE id_user = ?'
			)
			const row = selectStmt.get(user.id_user) as { avatar: string }
			if (!row) return err('NOT_FOUND')
			return ok(row.avatar)
		} catch (e: any) {
			return err(mapSqliteError(e))
		}
	}

	/**
	 * @description Get all users or users according to their status
	 */
	static getAllUsers(): Result<IUserUA[]> {
		try {
			const selectStmt = db.prepare(
				'SELECT id_user, avatar, status, last_connection FROM users'
			)
			const rows = selectStmt.all() as IUserUA[]
			return ok(rows)
		} catch (e: any) {
			return err(mapSqliteError(e))
		}
	}

	static getOnlineUsers(): Result<IUserUA[]> {
		try {
			const selectStmt = db.prepare(
				'SELECT id_user, avatar, status, last_connection FROM users WHERE status = 1'
			)
			const rows = selectStmt.all() as IUserUA[]
			return ok(rows)
		} catch (e: any) {
			return err(mapSqliteError(e))
		}
	}

	/**
	 * @description Delete user by id
	 */
	static deleteUserById(user: IUserId): Result<null> {
		try {
			const deleteStmt = db.prepare('DELETE FROM users WHERE id_user = ?')
			deleteStmt.run(user.id_user)
			return ok(null)
		} catch (e: any) {
			return err(mapSqliteError(e))
		}
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
