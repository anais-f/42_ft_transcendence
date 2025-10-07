import { getDb } from '../database/connection.js'
import { UserRow } from '../models/userModels.js'

const db = () => getDb()

export function createUser(username: string, passwordHash: string) {
	const stmt = db().prepare(
		'INSERT INTO users (username, password) VALUES (?, ?)'
	)
	stmt.run(username, passwordHash)
}

export function findUserByUsername(username: string): UserRow | undefined {
	const stmt = db().prepare('SELECT * FROM users WHERE username = ?')
	return stmt.get(username) as UserRow | undefined
}

export function findPublicUserByUsername(username: string) {
  const stmt = db().prepare('SELECT id_user, username FROM users WHERE username = ?')
  return stmt.get(username) as { id_user: number; username: string } | undefined
}

export function findPublicUserById(id: number) {
	const stmt = db().prepare('SELECT id_user, username FROM users WHERE id_user = ?')
	return stmt.get(id) as { id_user: number; username: string } | undefined
}

export function listPublicUsers() {
	const stmt = db().prepare('SELECT id_user, username FROM users')
	return stmt.all() as { id_user: number; username: string }[]
}
