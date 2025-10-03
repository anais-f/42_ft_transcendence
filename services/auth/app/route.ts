import { FastifyInstance } from 'fastify';
import { AuthController } from './controllers.js';

export default async function routes(fastify: FastifyInstance) {
  // Route d'export des données utilisateurs pour users-account
  fastify.get('/api/auth/users', AuthController.getAllUsers);

  // Route de création de compte utilisateur
  fastify.post('/api/auth/register', AuthController.register);
}