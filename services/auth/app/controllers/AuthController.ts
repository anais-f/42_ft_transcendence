import { db } from '../index.ts';
import Fastify from 'fastify';

// Route export des données utilisateurs pour users-account
fastify.get('/auth/users', async (request, reply) => {
  try {
    // Requête pour récupérer tous les utilisateurs
    const users = db.prepare('SELECT id_user, username FROM users').all();
    reply.send({ users });
  } catch (err) {
    reply.status(500).send({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// creation d'un compte utilisateur
fastify.post('/auth/createAccount', async (request, reply) => {
  const { username, password } = request.body;
  // Valider, vérifier unicité, hasher le mot de passe puis insérer en base

  try {
    const insertStmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    insertStmt.run(username, password);

    const newUser = { id_user: db.prepare('SELECT last_insert_rowid() as id_user').get().id_user, username };
    const webhookUrl = 'http://users:3000/users/webhookNewUser';
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      console.log('Webhook sent successfully');
    }
    catch (err) {
      console.error('Error sending webhook: ', err);
    }
    reply.code(201).send({ status: 'account created', username });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      reply.status(400).send({ error: 'Username already exists' });
      return;
    }
    reply.status(500).send({ error: 'Database error' });
    return;
  }
  return { status: 'account created', username };
});