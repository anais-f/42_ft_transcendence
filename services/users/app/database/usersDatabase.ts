import DatabaseConstructor from 'better-sqlite3'
import type { Database } from 'better-sqlite3'

export const db: Database = new DatabaseConstructor(process.env.USERS_DB_PATH)

db.pragma('journal_mode = WAL')
db.pragma('synchronous = NORMAL')
db.pragma('cache_size = -64000')
db.pragma('busy_timeout = 5000')

db.exec(`  CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    avatar TEXT NOT NULL,
    status INTEGER NOT NULL,
    last_connection TEXT NOT NULL
  )`)

console.log('DB users created')
