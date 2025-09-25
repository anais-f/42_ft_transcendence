// configuration DB

import DatabaseConstructor from 'better-sqlite3';
import type { Database } from 'better-sqlite3';

export const db: Database = new DatabaseConstructor('../db-users.sqlite');

db.exec("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, avatar BLOB, status BOOLEAN, last_connection DATETIME)")
