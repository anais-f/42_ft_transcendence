import BetterSqlite3 from 'better-sqlite3'
import type { Database } from 'better-sqlite3'

let db: Database

export function getDb(): Database {
	if (!db) {
		const path = process.env.TWOFA_DB_PATH
		if (!path) {
			throw new Error(
				'TWOFA_DB_PATH environment variable is required to connect to the database'
			)
		}
		db = new BetterSqlite3(path)
	}
	return db
}

export function runMigrations() {
	const db = getDb()
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
