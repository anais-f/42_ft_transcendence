import DatabaseConstructor from 'better-sqlite3'
import type { Database } from 'better-sqlite3'

export const db: Database = new DatabaseConstructor('./db-users.sqlite')
// export const db: Database = new DatabaseConstructor('/user/src/app/db-users.sqlite')

db.exec(`  CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    avatar TEXT NOT NULL,
    status INTEGER NOT NULL,
    last_connection TEXT NOT NULL
  )`)


console.log('DB users created')
