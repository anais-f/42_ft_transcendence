import BetterSqlite3 from 'better-sqlite3'
import type { Database } from 'better-sqlite3'
import { mkdirSync } from 'fs'
import { dirname } from 'path'
import { env } from '../env/checkEnv.js'

let db: Database

export function getDb(): Database {
	if (!db) {
		// Ensure directory exists
		mkdirSync(dirname(env.TWOFA_DB_PATH), { recursive: true })
		db = new BetterSqlite3(env.TWOFA_DB_PATH)
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
    CREATE TABLE IF NOT EXISTS twofa_secrets (
      user_id INTEGER PRIMARY KEY,
      secret_enc TEXT NOT NULL,
      active INTEGER DEFAULT 0,
      pending_until INTEGER NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)
}
