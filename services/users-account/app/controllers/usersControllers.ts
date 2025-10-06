/* Example Users Controller

import { UserServices } from '../services/userServices';
import { UserSchema } from '../models/UsersDTO';

export const getUsers = async (req, res) => {
  const users = await UserServices.getAllUsers();
  res.send(users);
};

export const createUser = async (req, res) => {
  const parse = UserSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).send({ error: 'Invalid data' });
  }
  await UserServices.createUser(parse.data);
  res.send({ success: true });
};

 */

import { UsersServices } from '../services/usersServices.js'
import { FastifyRequest, FastifyReply } from 'fastify'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/utils.js'
import { UserIdDTO } from '../models/UsersDTO.js'

/**
 * Handle user creation via webhook
 * @description This function handles the creation of a new user when a webhook notification is received from the auth service.
 * It checks if the user already exists and creates a new user if not. Responds with appropriate status codes and messages based on the operation outcome.
 * @param req
 * @param res
 */
export async function handleUserCreated(
	req: FastifyRequest<{ Body: UserIdDTO }>,
	res: FastifyReply
): Promise<FastifyReply> {
	try {
		const newUser: UserIdDTO = req.body

		await UsersServices.createUser(newUser)
		return res
			.status(201)
			.send({ success: true, message: SUCCESS_MESSAGES.USER_CREATED })
	} catch (error) {
		if (
			error instanceof Error &&
			error.message === ERROR_MESSAGES.USER_ALREADY_EXISTS
		) {
			return res
				.status(200)
				.send({ success: true, message: ERROR_MESSAGES.USER_ALREADY_EXISTS })
		}
		return res
			.status(500)
			.send({ success: false, error: ERROR_MESSAGES.INTERNAL_ERROR })
	}
}

export async function getUser(req: FastifyRequest, res: FastifyReply) {
	return res.status(200).send({ success: true })
	// TODO: implement get user with enrichissement from auth service
}
