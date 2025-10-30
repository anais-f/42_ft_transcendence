import { UsersServices } from '../usecases/usersServices.js'
import { FastifyRequest, FastifyReply } from 'fastify'
import {
	PublicUserAuthDTO,
	UserPublicProfileSchema,
	UserPrivateProfileSchema,
	AppError,
	ERROR_MESSAGES,
	SUCCESS_MESSAGES
} from '@ft_transcendence/common'

export async function handleUserCreated(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	try {
		const newUser = req.body as PublicUserAuthDTO
		await UsersServices.createUser(newUser)
		void reply
			.code(201)
			.send({ success: true, message: SUCCESS_MESSAGES.USER_CREATED })
	} catch (error) {
		if (
			error instanceof Error &&
			error.message === ERROR_MESSAGES.USER_ALREADY_EXISTS
		) {
			void reply
				.code(200)
				.send({ success: true, message: ERROR_MESSAGES.USER_ALREADY_EXISTS })
			return
		}
		void reply
			.code(500)
			.send({ success: false, error: ERROR_MESSAGES.INTERNAL_ERROR })
		return
	}
}

export async function getPublicUser(
	req: FastifyRequest & { params: { id: number } },
	reply: FastifyReply
): Promise<void> {
	const idNumber = req.params.id
	console.log('Fetching user with id number:', idNumber)
	console.log('requete recu :', req.params)

	try {
		const rawProfile = await UsersServices.getPublicUserProfile({
			user_id: idNumber
		})

		const parsed = UserPublicProfileSchema.safeParse(rawProfile)
		if (!parsed.success) {
			console.error('UserProfile validation failed:', parsed.error)
			void reply
				.code(500)
				.send({ success: false, error: ERROR_MESSAGES.INTERNAL_ERROR })
			return
		}

		void reply.code(200).send(parsed.data)
	} catch (error: any) {
		if (error instanceof AppError) {
			void reply
				.code(error.status)
				.send({ success: false, error: error.message })
			return
		}
		throw error
	}
}

export async function getPrivateUser(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	try {
		const userId = req.user?.user_id as number

		const rawProfile = await UsersServices.getPrivateUserProfile({
			user_id: userId
		})

		const parsed = UserPrivateProfileSchema.safeParse(rawProfile)
		if (!parsed.success) {
			console.error('UserPrivateProfile validation failed:', parsed.error)
			void reply
				.code(500)
				.send({ success: false, error: ERROR_MESSAGES.INTERNAL_ERROR })
			return
		}

		void reply.code(200).send(parsed.data)
	} catch (error: any) {
		if (error instanceof AppError) {
			// 404 NOT FOUND : JWT valide mais utilisateur supprimé de la DB
			void reply
				.code(error.status)
				.send({ success: false, error: error.message })
			return
		}
		console.error('Unexpected error in getPrivateUser:', error)
		void reply
			.code(500)
			.send({ success: false, error: ERROR_MESSAGES.INTERNAL_ERROR })
	}
}
