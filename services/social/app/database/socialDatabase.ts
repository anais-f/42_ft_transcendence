import DatabaseConstructor from 'better-sqlite3'
import type { Database } from 'better-sqlite3'

export const db: Database = new DatabaseConstructor('./db-social.sqlite')
// export const db: Database = new DatabaseConstructor('/social/src/app/db-social.sqlite')

db.exec('CREATE TABLE IF NOT EXISTS relations ( id_user INTEGER, friend_id INTEGER, relation_status INTEGER, origid_id INTEGER, PRIMARY KEY (id_user, friend_id) )')

console.log('Social DB created')

// Table relations
// 0 -> pending
// 1 -> friends

