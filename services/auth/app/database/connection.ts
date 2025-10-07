import BetterSqlite3 from 'better-sqlite3'
import type { Database } from 'better-sqlite3'

let db: Database

export function getDb(): Database {
	if (!db) {
		db = new BetterSqlite3('db-auth.sqlite')
	}
	return db
}

export function runMigrations() {
	const db = getDb()
	db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id_user INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `)
}
