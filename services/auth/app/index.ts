import Fastify from 'fastify';
import DatabaseConstructor from 'better-sqlite3';
import type { Database } from 'better-sqlite3';
import routes from './route.js';

// Base de données
export const db: Database = new DatabaseConstructor('./database.sqlite');

// Création de la table et insertion des données de test
db.exec(
  'CREATE TABLE IF NOT EXISTS users (id_user INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)'
);

const stmt = db.prepare('INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)');
stmt.run('anfichet', 'passwd');
stmt.run('acancel', 'passwd');
stmt.run('lrio', 'passwd');
stmt.run('mjuffard', 'passwd');

// Configuration Fastify
const app = Fastify({
  logger: false,
});

// Enregistrement des routes
app.register(routes);

// Démarrage du serveur
const start = async () => {
  try {
    await app.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Serveur auth en écoute sur le port 3001');
  } catch (err) {
    console.error('Erreur lors du démarrage du serveur: ', err);
    process.exit(1);
  }
};

start();