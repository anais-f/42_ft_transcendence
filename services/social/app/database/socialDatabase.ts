import DatabaseConstructor from 'better-sqlite3'
import type { Database } from 'better-sqlite3'

export const db: Database = new DatabaseConstructor(process.env.SOCIAL_DB_PATH)

db.exec('CREATE TABLE IF NOT EXISTS relations ( user_id INTEGER, friend_id INTEGER, relation_status INTEGER, origin_id INTEGER, PRIMARY KEY (user_id, friend_id) )')

console.log('Social DB created')

// Table relations
// 0 -> pending
// 1 -> friends

