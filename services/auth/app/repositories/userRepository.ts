import { getDb } from '../database/connection.js'
import {
	IUserAuth,
	PublicUserAuthDTO,
	PublicUserListAuthDTO
} from '@ft_transcendence/common'

const db = () => getDb()

export function createUser(login: string, passwordHash: string) {
	const stmt = db().prepare('INSERT INTO users (login, password) VALUES (?, ?)')
	stmt.run(login, passwordHash)
}

export function createAdminUser(login: string, passwordHash: string) {
	const stmt = db().prepare(
		'INSERT INTO users (login, password, is_admin) VALUES (?, ?, ?)'
	)
	stmt.run(login, passwordHash, 1)
}

export function findUserByLogin(login: string): IUserAuth | undefined {
	const stmt = db().prepare('SELECT * FROM users WHERE login = ?')
	return stmt.get(login) as IUserAuth | undefined
}

export function findPublicUserByLogin(
	login: string
): PublicUserAuthDTO | undefined {
	const stmt = db().prepare('SELECT user_id, login FROM users WHERE login = ?')
	return stmt.get(login) as PublicUserAuthDTO | undefined
}

export function findPublicUserById(id: number): PublicUserAuthDTO | undefined {
	const stmt = db().prepare(
		'SELECT user_id, login FROM users WHERE user_id = ?'
	)
	return stmt.get(id) as PublicUserAuthDTO | undefined
}

export function listPublicUsers(): PublicUserListAuthDTO | undefined {
	const stmt = db().prepare('SELECT user_id, login FROM users')
	console.log('stmt', stmt.all())
	const users = stmt.all() as { user_id: number; login: string }[]
	return { users }
}

export function deleteUserById(id: number): boolean {
	const stmt = db().prepare('DELETE FROM users WHERE user_id = ?')
	const info = stmt.run(id)
	return info.changes > 0
}

export function createGoogleUser(google_id: string) {
	let login = `google-${google_id}`
	const stmt = db().prepare(
		'INSERT INTO users (login, google_id) VALUES (?, ?)'
	)
	stmt.run(login, google_id)
}

export function findUserByGoogleId(google_id: string) {
	const stmt = db().prepare('SELECT * FROM users WHERE google_id = ?')
	return stmt.get(google_id) as IUserAuth | undefined
}

export function changeUserPassword(id: number, passwordHash: string): boolean {
	const stmt = db().prepare('UPDATE users SET password = ? WHERE user_id = ?')
	const info = stmt.run(passwordHash, id)
	return info.changes > 0
}
