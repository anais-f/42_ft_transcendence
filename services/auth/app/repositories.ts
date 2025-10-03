import { db } from './index.js';

export const AuthRepository = {
  // Récupérer tous les utilisateurs pour l'export vers users-account
  getAllUsers: () => {
    return db.prepare('SELECT id_user FROM users').all();
  },

  // Créer un nouvel utilisateur
  createUser: (username: string, password: string) => {
    const insertStmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    insertStmt.run(username, password);
    return db.prepare('SELECT last_insert_rowid() as id_user').get() as { id_user: number };
  },

  // Supprimer un utilisateur (utilisé si le webhook échoue)
  deleteUser: (id_user: number) => {
    const deleteStmt = db.prepare('DELETE FROM users WHERE id_user = ?');
    deleteStmt.run(id_user);
  },
};