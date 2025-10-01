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


// faire le webhiik a chaque notif et tout les X temps faire un fetch de la DB auth pour update/create les users et comparer si j'en ai un manquant

/*
Service AUTH : Quand un utilisateur se crée → envoie POST vers http://users-account:3000/users/webhookNewUser
Service USERS : Reçoit le webhook → vérifie si l'utilisateur existe → l'insère si nécessaire
Le traitement du webhook se fait donc à chaque fois qu'AUTH envoie une notification de création d'utilisateur. C'est automatique une fois que vous avez décommenté app.register(userRoutes) ou ajouté la route directement.
*/

/*
import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  UserIdSchema,
  UserStatusSchema,
  UserAvatarSchema,
  WebhookNewUserSchema,
  UserResponseSchema,
  UsersListResponseSchema
} from '../models/UsersDTO.js';
import { UserServicesRequests } from '../services/UserServices.js';

const userRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // GET /users - Récupérer tous les utilisateurs
  server.get('/users', {
    schema: {
      response: {
        200: UsersListResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const users = await UserServicesRequests.getAllUsers();
      return { users };
    } catch (error) {
      reply.status(500).send({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
  });

  // GET /users/:id - Récupérer un utilisateur par ID
  server.get('/users/:id', {
    schema: {
      params: UserIdSchema,
      response: {
        200: UserResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const user = UserServicesRequests.getUserById({ id_user: request.params.id_user });
      if (!user) {
        return reply.status(404).send({ error: 'Utilisateur non trouvé' });
      }
      return user;
    } catch (error) {
      reply.status(500).send({ error: 'Erreur serveur' });
    }
  });

  // PUT /users/status - Mettre à jour le statut d'un utilisateur
  server.put('/users/status', {
    schema: {
      body: UserStatusSchema
    }
  }, async (request, reply) => {
    try {
      UserServicesRequests.setUserStatus(request.body);
      return { success: true };
    } catch (error) {
      reply.status(500).send({ error: 'Erreur lors de la mise à jour du statut' });
    }
  });

  // PUT /users/avatar - Mettre à jour l'avatar d'un utilisateur
  server.put('/users/avatar', {
    schema: {
      body: UserAvatarSchema
    }
  }, async (request, reply) => {
    try {
      UserServicesRequests.setUserAvatar(request.body);
      return { success: true };
    } catch (error) {
      reply.status(500).send({ error: 'Erreur lors de la mise à jour de l\'avatar' });
    }
  });

  // POST /users/webhookNewUser - Webhook pour recevoir les nouveaux utilisateurs
  server.post('/users/webhookNewUser', {
    schema: {
      body: WebhookNewUserSchema
    }
  }, async (request, reply) => {
    try {
      console.log('Webhook reçu:', request.body);
      
      // Vérifier si l'utilisateur existe déjà
      if (!UserServicesRequests.userExists({ id_user: request.body.id_user })) {
        // Insérer le nouvel utilisateur
        UserServicesRequests.insertUser({ id_user: request.body.id_user });
        console.log(`Nouvel utilisateur créé: ${request.body.username} (ID: ${request.body.id_user})`);
      } else {
        console.log(`Utilisateur déjà existant: ${request.body.username} (ID: ${request.body.id_user})`);
      }
      
      return { success: true, message: 'Webhook traité avec succès' };
    } catch (error) {
      console.error('Erreur webhook:', error);
      reply.status(500).send({ error: 'Erreur lors du traitement du webhook' });
    }
  });
};

export default userRoutes;
*/