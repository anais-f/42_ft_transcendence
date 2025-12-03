import DatabaseConstructor from 'better-sqlite3'
import type { Database } from 'better-sqlite3'

export const db: Database = new DatabaseConstructor(process.env.SOCIAL_DB_PATH)

db.exec(
	'CREATE TABLE IF NOT EXISTS relations ( user_id INTEGER, friend_id INTEGER, relation_status INTEGER NOT NULL CHECK (relation_status IN (0, 1)), origin_id INTEGER NOT NULL CHECK(origin_id = user_id OR origin_id = friend_id), PRIMARY KEY (user_id, friend_id) )'
)

console.log('Social DB created')

// Table relations
// 0 -> pending
// 1 -> friends
