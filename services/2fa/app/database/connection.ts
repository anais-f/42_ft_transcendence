import BetterSqlite3 from 'better-sqlite3'
import type { Database } from 'better-sqlite3'
import { mkdirSync } from 'fs'
import { dirname } from 'path'

let db: Database

export function getDb(): Database {
	if (!db) {
		const path = process.env.TWOFA_DB_PATH
		if (!path) {
			throw new Error(
				'TWOFA_DB_PATH environment variable is required to connect to the database'
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
    CREATE TABLE IF NOT EXISTS twofa_secrets (
      user_id INTEGER PRIMARY KEY,
      secret_enc TEXT NOT NULL,
      active INTEGER DEFAULT 0,
      pending_until INTEGER NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)
}
