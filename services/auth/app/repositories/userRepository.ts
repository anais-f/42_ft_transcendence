import { getDb } from '../database/connection.js'
import { IUserAuth } from '@ft_transcendence/common'

const db = () => getDb()

export function createUser(login: string, passwordHash: string) {
	const stmt = db().prepare('INSERT INTO users (login, password) VALUES (?, ?)')
	stmt.run(login, passwordHash)
}

export function findUserByLogin(login: string) {
	const stmt = db().prepare('SELECT * FROM users WHERE login = ?')
	return stmt.get(login) as IUserAuth | undefined
}

export function findPublicUserByLogin(login: string) {
	const stmt = db().prepare('SELECT user_id, login FROM users WHERE login = ?')
	return stmt.get(login) as { id: number; login: string } | undefined
}

export function findPublicUserById(id: number) {
	const stmt = db().prepare(
		'SELECT user_id, login FROM users WHERE user_id = ?'
	)
	return stmt.get(id) as { id: number; login: string } | undefined
}

export function listPublicUsers() {
	const stmt = db().prepare('SELECT user_id, login FROM users')
	console.log('stmt', stmt.all())
	return stmt.all() as { id: number; login: string }[]
}

export function deleteUserById(id: number) {
	const stmt = db().prepare('DELETE FROM users WHERE user_id = ?')
	const info = stmt.run(id)
	return info.changes > 0
}
