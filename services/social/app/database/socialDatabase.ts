import DatabaseConstructor from 'better-sqlite3'
import type { Database } from 'better-sqlite3'

export const db: Database = new DatabaseConstructor(process.env.SOCIAL_DB_PATH)

db.pragma('journal_mode = WAL')
db.pragma('synchronous = NORMAL')
db.pragma('cache_size = -64000')
db.pragma('busy_timeout = 5000')

db.exec(
	'CREATE TABLE IF NOT EXISTS relations ( user_id INTEGER, friend_id INTEGER, relation_status INTEGER NOT NULL CHECK (relation_status IN (0, 1)), origin_id INTEGER NOT NULL CHECK(origin_id = user_id OR origin_id = friend_id), PRIMARY KEY (user_id, friend_id) )'
)

console.log('Social DB created')
