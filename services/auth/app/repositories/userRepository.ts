import { getDb } from '../database/connection.js'
import { IUserRow } from '../models/userModels.js'

const db = () => getDb()

export function createUser(username: string, passwordHash: string) {
	const stmt = db().prepare(
		'INSERT INTO users (username, password) VALUES (?, ?)'
	)
	stmt.run(username, passwordHash)
}

export function findUserByUsername(username: string) {
	const stmt = db().prepare('SELECT * FROM users WHERE username = ?')
	return stmt.get(username) as IUserRow | undefined
}

export function findPublicUserByUsername(username: string) {
	const stmt = db().prepare(
		'SELECT id_user, username FROM users WHERE username = ?'
	)
	return stmt.get(username) as { id: number; username: string } | undefined
}

export function findPublicUserById(id: number) {
	const stmt = db().prepare(
		'SELECT id_user, username FROM users WHERE id_user = ?'
	)
	return stmt.get(id) as { id: number; username: string } | undefined
}

export function listPublicUsers() {
	const stmt = db().prepare('SELECT id_user, username FROM users')
	return stmt.all() as { id: number; username: string }[]
}

export function deleteUserById(id: number) {
	const stmt = db().prepare('DELETE FROM users WHERE id_user = ?')
	const info = stmt.run(id)
	return info.changes > 0
}
