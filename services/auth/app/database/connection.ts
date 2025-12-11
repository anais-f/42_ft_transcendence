import BetterSqlite3 from 'better-sqlite3'
import type { Database } from 'better-sqlite3'
import { mkdirSync } from 'fs'
import { dirname } from 'path'

let db: Database

export function getDb(): Database {
	if (!db) {
		const path = process.env.AUTH_DB_PATH
		if (!path) {
			throw new Error(
				'AUTH_DB_PATH environment variable is required to connect to the database'
			)
		}
		// Ensure directory exists
		mkdirSync(dirname(path), { recursive: true })
		db = new BetterSqlite3(path)
	}
	return db
}

export function runMigrations() {
	const db = getDb()

	db.pragma('journal_mode = WAL')
	db.pragma('synchronous = NORMAL')
	db.pragma('cache_size = -64000')
	db.pragma('busy_timeout = 5000')

	db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
	  session_id INTEGER DEFAULT 0,
      login TEXT UNIQUE NOT NULL,
      password TEXT,
	  google_id TEXT UNIQUE,
	  is_admin BOOLEAN DEFAULT FALSE,
	  two_fa_enabled BOOLEAN DEFAULT 0
    );
  `)
}
