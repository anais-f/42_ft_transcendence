// accès DB call SQL et persistance des données
/*

    Abstraction de la base de données.

    Contiennent les requêtes SQL ou ORM.

    Gestion directe des opérations CRUD.

    Ex: UserRepository.insert(), UserRepository.findById().
*/
// bool status 0 = offline, 1 = online
//TODO: changer l'adresse de l'avatar par defaut

import { db } from '../database/database'

export class UsersRepository {

  static insertManyUsers(users: { id_user: number }[]) {
    const insertStmt = db.prepare('INSERT OR IGNORE INTO users (id_user, avatar, status, last_connection) VALUES (?, ?, ?, ?)')
    const now = new Date().toISOString()
    const insertMany = db.transaction((users) => {
      for (const user of users)
        insertStmt.run(user.id_user, '../img.png', true, now)
    })
    insertMany(users)
  }

  static insertUser(user: { id_user: number }) {
    const insertStmt = db.prepare('INSERT OR IGNORE INTO users (id_user, avatar, status, last_connection) VALUES (?, ?, ?, ?)')
    const now = new Date().toISOString()
    insertStmt.run(user.id_user, '../img.png', 1, now)
  }


  //
  // static setUserStatus(id_user: number, status: boolean) {
  //   const updateStmt = database.prepare('UPDATE users SET status = ?, last_connection = ? WHERE id_user = ?');
  //   const now = new Date().toISOString();
  //   updateStmt.run(status, now, id_user);
  // }
  //
  // static getAllUsers() {
  //   const selectStmt = database.prepare('SELECT id_user, avatar, status, last_connection FROM users');
  //   return selectStmt.all();
  // }
  //
  // static getUserById(id_user: number) {
  //   const selectStmt = database.prepare('SELECT id_user, avatar, status, last_connection FROM users WHERE id_user = ?');
  //   return selectStmt.get(id_user);
  // }
}
