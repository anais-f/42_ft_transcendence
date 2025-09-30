// recoit les requetes HTTP et retourne du JSON
/*
  contient les routes HTTP (Fastify, Express, etc.).
    Recevoir les requêtes HTTP.
    Valider les données d’entrée.
    Appeler les services métier pour la logique.
    Renvoyer la réponse au client.
    Ne contenir quasiment pas de logique métier.
 */

// utilisation ici des schemas de validation et de typage avec Zod

// import { FastifyPluginAsync } from 'fastify';
// import { z } from 'zod';
// import { UserSchema } from '../models/users';
//
// const controller: FastifyPluginAsync = async (fastify, opts) => {
//   fastify.post('/', {
//     schema: {
//       body: UserSchema,
//     },
//   }, async (request, reply) => {
//     // request.body typed thanks to Zod schema
//     reply.send({ message: 'User created', user: request.body });
//   });
// };
//
// export default controller;
