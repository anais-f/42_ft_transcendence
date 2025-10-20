import { UsersServices } from '../usecases/usersServices.js'
import { FastifyRequest, FastifyReply } from 'fastify'
import {
	PublicUserDTO,
	UserIdDTO,
	UserPrivateProfileSchema,
	AppError,
	ERROR_MESSAGES,
	SUCCESS_MESSAGES
} from '@ft_transcendence/common'

/**
 * Handle user creation via webhook
 * @description This function handles the creation of a new user when a webhook notification is received from the auth service.
 * It checks if the user already exists and creates a new user if not. Responds with appropriate status codes and messages based on the operation outcome.
 * @param req
 * @param res
 */
export async function handleUserCreated(
	req: FastifyRequest<{ Body: PublicUserDTO }>,
	res: FastifyReply
): Promise<FastifyReply> {
	try {
		const newUser: PublicUserDTO = req.body
		const idUser: UserIdDTO = { user_id: newUser.user_id }

		await UsersServices.createUser(idUser)
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

export async function getUser(
	req: FastifyRequest<{ Params: { id: string } }>,
	res: FastifyReply
): Promise<FastifyReply> {
	try {
		const { id } = req.params

		const idNumber = Number(id)
		console.log('Fetching user with id number:', idNumber)
		if (!id || isNaN(idNumber) || idNumber <= 0)
			return res
				.status(400)
				.send({ success: false, error: ERROR_MESSAGES.INVALID_USER_ID })

		const rawProfile = await UsersServices.getUserProfile({ user_id: idNumber })

		const parsed = UserPrivateProfileSchema.safeParse(rawProfile)
		if (!parsed.success) {
			console.error('UserProfile validation failed:', parsed.error)
			return res
				.status(500)
				.send({ success: false, error: ERROR_MESSAGES.INTERNAL_ERROR })
		}

		// return res.status(200).send(parsed.data)
		return res.status(200).send({ success: true, data: parsed.data })
	} catch (error) {
		if (error instanceof AppError) {
			return res
				.status(error.status)
				.send({ success: false, error: error.message })
			// return res
			// 	.status(404)
			// 	.send({ success: false, error: ERROR_MESSAGES.USER_NOT_FOUND })
		}
		console.error('Unexpected error in getUser:', error)
		return res
			.status(500)
			.send({ success: false, error: ERROR_MESSAGES.INTERNAL_ERROR })
		// return res
		// 	.status(500)
		// 	.send({ success: false, error: ERROR_MESSAGES.INTERNAL_ERROR })
	}
}
