/*
Example routes

import { getUsers, createUser } from '../controllers/usersController';

export default function (fastify, opts, done) {
  fastify.get('/users', getUsers);
  fastify.post('/users', createUser);
  done();
}
fastify.METHOD(PATH, OPTIONS, HANDLER)
 */

import { FastifyPluginAsync } from 'fastify'
import {
	SuccessResponseSchema,
	ErrorResponseSchema,
	NewUserSchema,
} from '../models/UsersDTO.js'
import { handleUserCreated } from '../controllers/usersControllers.js'

export const usersRoutes: FastifyPluginAsync = async (fastify) => {
	// POST /users/webhookNewUser - Webhook pour créer un nouvel utilisateur quand je recois la notif de auth
	fastify.post(
		'/api/users/webhookNewUser',
		{
			schema: {
				body: NewUserSchema,
				response: {
					200: SuccessResponseSchema,
					201: SuccessResponseSchema,
					400: ErrorResponseSchema,
					500: ErrorResponseSchema,
				},
			},
		},
		handleUserCreated
	)

	// fastify.get('/users/:id', {
	//   schema: {
	//     response: {
	//       200: UserResponseSchema,
	//       404: ErrorResponseSchema,
	//       500: ErrorResponseSchema,
	//     }
	//   }
	// }, getUser);
}
