import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthRepository } from './repositories.js';

export const AuthController = {
  // Exporter les données utilisateurs pour users-account
  getAllUsers: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const users = await AuthRepository.getAllUsers();
      reply.send(users);
    } catch (err) {
      reply.status(500).send({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
  },

  // Création d'un compte utilisateur
  register: async (request: FastifyRequest, reply: FastifyReply) => {
    const { username, password } = request.body as { username: string; password: string };

    try {
      const userId = AuthRepository.createUser(username, password);
      const newUser = { id_user: userId.id_user };

      // Webhook SYNCHRONE - doit réussir pour valider la création -> donc pas de onResponse de fastify, ni de preHandler à cause du id_user généré à la création
      const webhookUrl = 'http://localhost:3000/users/webhookNewUser';
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (!webhookResponse.ok) {
        // Si le webhook échoue, on annule la création en supprimant l'utilisateur
        AuthRepository.deleteUser(userId.id_user);
        reply.status(400).send({
          error: `Erreur synchronisation users-account: ${webhookResponse.statusText}`
        });
        return;
      }

      reply.code(201).send({ status: 'compte créé', username });
    } catch (err: any) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        reply.status(400).send({ error: 'Nom d\'utilisateur déjà existant' });
        return;
      }
      reply.status(500).send({ error: 'Erreur de base de données' });
    }
  },
};