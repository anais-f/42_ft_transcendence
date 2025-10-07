import { UsersServices } from '@services/users-account/app/usecases/usersServices.js'
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

export async function getUser(req: FastifyRequest<{ Body: UserIdDTO }>, res: FastifyReply): Promise<FastifyReply> {
  try {
    const id = req.body as UserIdDTO;

    const userProfile = await UsersServices.getUserProfile(id);
    return res.status(200).send({ success: true, data: userProfile });
  } catch (error) {
    if (error instanceof Error && error.message === ERROR_MESSAGES.USER_NOT_FOUND) {
      return res.status(404).send({ success: false, error: ERROR_MESSAGES.USER_NOT_FOUND });
    }
    return res.status(500).send({ success: false, error: ERROR_MESSAGES.INTERNAL_ERROR });
  }
}

