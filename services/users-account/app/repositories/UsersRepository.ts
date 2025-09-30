// accès DB call SQL et persistance des données
/*
    Abstraction de la base de données.
    Contiennent les requêtes SQL ou ORM.
    Gestion directe des opérations CRUD.
    Ex: UserRepository.insert(), UserRepository.findById().
*/
// bool status 0 = offline, 1 = online
// TODO: changer l'adresse de l'avatar par defaut
// TODO: pouvoir changer le username -> call avec l'auth pour la modif
// TODO: get username (from auth service)
// TODO: get all users avec le username (from auth service)

import { db } from '../database/database.js'
import type {
	User,
	UserStatus,
	UserConnection,
	UserAvatar,
	UserId,
} from '../models/Users.js'

const defaultAvatar: string = '../img.png' // default avatar path

export class UsersRepository {
  static userExists(user: UserId): boolean {
    const selectStmt = db.prepare('SELECT 1 FROM users WHERE id_user = ?')
    const row = selectStmt.get(user.id_user)
    return !!row
  }

	// INSERT methods
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

	// SET / UPDATE methods
	static setUserStatus(user: UserStatus) {
		const updateStmt = db.prepare(
			'UPDATE users SET status = ? WHERE id_user = ?'
		)
		updateStmt.run(user.status, user.id_user)
	}

	static setLastConnection(user: UserConnection) {
		const updateStmt = db.prepare(
			'UPDATE users SET last_connection = ? WHERE id_user = ?'
		)
		const now = new Date().toISOString()
		updateStmt.run(now, user.id_user)
	}

	static setUserAvatar(user: UserAvatar) {
		const updateStmt = db.prepare(
			'UPDATE users SET avatar = ? WHERE id_user = ?'
		)
		updateStmt.run(user.avatar, user.id_user)
	}

	// GET methods
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
}
