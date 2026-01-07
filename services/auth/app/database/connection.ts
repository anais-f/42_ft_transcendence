import BetterSqlite3 from 'better-sqlite3'
import type { Database } from 'better-sqlite3'
import { mkdirSync } from 'fs'
import { dirname } from 'path'
import { env } from '../env/checkEnv.js'

let db: Database

export function getDb(): Database {
	if (!db) {
		const path = env.AUTH_DB_PATH
		// Ensure directory exists
		mkdirSync(dirname(path), { recursive: true })
		db = new BetterSqlite3(path)
	}
	return db
}

export function initDB() {
	const db = getDb()

	db.pragma('journal_mode = WAL')
	db.pragma('synchronous = NORMAL')
	db.pragma('cache_size = -64000')
	db.pragma('busy_timeout = 5000')

	db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      login TEXT UNIQUE NOT NULL,
      password TEXT,
	  google_id TEXT UNIQUE,
	  is_admin BOOLEAN DEFAULT FALSE
    );
	CREATE UNIQUE INDEX IF NOT EXISTS idx_users_login_nocase ON users(LOWER(login));
  `)
}
