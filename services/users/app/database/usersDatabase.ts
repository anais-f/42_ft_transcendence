import DatabaseConstructor from 'better-sqlite3'
import type { Database } from 'better-sqlite3'
import { ENV } from '../config/env.js'

export const db: Database = new DatabaseConstructor(ENV.DB_PATH)

db.exec(`  CREATE TABLE IF NOT EXISTS users (
    id_user INTEGER PRIMARY KEY,
    avatar TEXT NOT NULL,
    status INTEGER NOT NULL,
    last_connection TEXT NOT NULL
  )`)

console.log('DB created')
