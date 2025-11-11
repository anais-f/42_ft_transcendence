import BetterSqlite3 from 'better-sqlite3'
import type { Database } from 'better-sqlite3'

let db: Database

export function getDb(): Database {
	if (!db) {
		db = new BetterSqlite3(process.env.AUTH_DB_PATH)
	}
	return db
}

export function runMigrations() {
	const db = getDb()
	db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      login TEXT UNIQUE NOT NULL,
      password TEXT,
	  google_id TEXT UNIQUE,
	  is_admin BOOLEAN DEFAULT FALSE,
	  two_fa_enabled BOOLEAN DEFAULT 0
    );
  `)
}
