import type { Database } from 'better-sqlite3'
import { mkdirSync } from 'fs'
import { dirname } from 'path'
import BetterSqlite3 from 'better-sqlite3'

let db: Database

export function getDb(): Database {
	if (!db) {
		const path = process.env.MATCHMAKING_DB_PATH
		if (!path) {
			throw new Error(
				'MATCHMAKING_DB_PATH environment variable is required to connect to the database'
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
	db.exec(`
		CREATE TABLE IF NOT EXISTS match_history (
			id_match INTEGER PRIMARY KEY AUTOINCREMENT,
			winner_id INTEGER NOT NULL,
			played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			round INTEGER DEFAULT NULL,
			id_tournament INTEGER DEFAULT NULL
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
