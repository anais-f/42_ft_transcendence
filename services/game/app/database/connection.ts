import type { Database } from 'better-sqlite3'
import { mkdirSync } from 'fs'
import { dirname } from 'path'
import BetterSqlite3 from 'better-sqlite3'
import { env } from '../env/checkEnv.js'

let db: Database

export function getDb(): Database {
	if (!db) {
		const path = env.GAME_DB_PATH
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
		CREATE TABLE IF NOT EXISTS match_history (
			id_match INTEGER PRIMARY KEY AUTOINCREMENT,
			winner_id INTEGER NOT NULL,
			played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			tournament_code TEXT DEFAULT NULL
		);

		CREATE TABLE IF NOT EXISTS match_player (
			id_match INTEGER NOT NULL,
			player_id INTEGER NOT NULL,
			score INTEGER DEFAULT 0,
			PRIMARY KEY (id_match, player_id),
			FOREIGN KEY (id_match) REFERENCES match_history(id_match) ON DELETE CASCADE
		);
	`)
}
