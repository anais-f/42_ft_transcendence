// configuration DB
/*

    Configuration de la connexion base de données (SQLite).

    Scripts de migration si nécessaire.

 */

import DatabaseConstructor from 'better-sqlite3';
import type { Database } from 'better-sqlite3';


export const db: Database = new DatabaseConstructor('../database-users.sqlite');

db.exec("CREATE TABLE IF NOT EXISTS users (id_user INTEGER PRIMARY KEY, avatar TEXT, status INTEGER, last_connection TEXT)")

