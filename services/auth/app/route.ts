import { FastifyInstance } from 'fastify';
import { AuthController } from './controllers';

export default async function routes(fastify: FastifyInstance) {
  // Route d'export des données utilisateurs pour users-account
  fastify.get('/auth/users', AuthController.getAllUsers);

  // Route de création de compte utilisateur
  fastify.post('/auth/register', AuthController.register);
}