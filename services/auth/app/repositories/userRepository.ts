import { getDb } from '../database/connection.js'
import { UserRow } from '../models/userModels.js'

const db = () => getDb()

export function createUser(username: string, passwordHash: string) {
  const stmt = db().prepare('INSERT INTO users (username, password) VALUES (?, ?)')
  stmt.run(username, passwordHash)
}

export function findUserByUsername(username: string): UserRow | undefined {
  const stmt = db().prepare('SELECT * FROM users WHERE username = ?')
  return stmt.get(username) as UserRow | undefined
}

export function findUserById(id: number) {
  const stmt = db().prepare('SELECT id, username FROM users WHERE id = ?')
  return stmt.get(id) as { id: number; username: string } | undefined
}

export function listUsers() {
  const stmt = db().prepare('SELECT id, username FROM users')
  return stmt.all() as { id: number; username: string }[]
}