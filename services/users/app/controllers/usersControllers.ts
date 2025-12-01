import { UsersServices } from '../usecases/usersServices.js'
import { FastifyRequest, FastifyReply } from 'fastify'
import {
	PublicUserAuthDTO,
	UserPublicProfileSchema,
	UserPrivateProfileSchema,
	AppError,
	ERROR_MESSAGES,
	SUCCESS_MESSAGES,
	GetUsersQuerySchema,
	GetUsersQueryDTO,
	UsersProfileSearchSchema
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
	req: FastifyRequest & { params: { user_id: number } },
	reply: FastifyReply
): Promise<void> {
	const idNumber = req.params.user_id
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
		const user = req.user as { user_id?: number } | undefined
		const userId = Number(user?.user_id)
		if (!userId || userId <= 0) {
			void reply
				.code(400)
				.send({ success: false, error: ERROR_MESSAGES.INVALID_USER_ID })
			return
		}

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

export async function getUsersController(
	req: FastifyRequest<{ Querystring: GetUsersQueryDTO }>,
	reply: FastifyReply
): Promise<void> {
	try {
		const query = req.query
		const user = req.user as
			| { user_id?: number; is_admin?: boolean }
			| undefined
		const isAdmin = user?.is_admin ?? false

		// Valider la query
		const safeQuery = GetUsersQuerySchema.safeParse(query)
		if (!safeQuery.success) {
			console.error('GetUsersQuery validation failed:', safeQuery.error)
			void reply.code(400).send({
				success: false,
				error: ERROR_MESSAGES.INVALID_QUERY_PARAMETERS
			})
			return
		}

		if (!isAdmin && !safeQuery.data.search) {
			void reply.code(403).send({
				success: false,
				error: 'Search parameter is required for non-admin users'
			})
			return
		}

		const rawUsers = await UsersServices.getUsersSearch({
			search: safeQuery.data.search,
			page: safeQuery.data.page,
			limit: safeQuery.data.limit
		})

		const parsed = UsersProfileSearchSchema.safeParse(rawUsers)
		if (!parsed.success) {
			console.error('UsersProfileSearch validation failed:', parsed.error)
			void reply.code(500).send({
				success: false,
				error: ERROR_MESSAGES.INTERNAL_ERROR
			})
			return
		}

		void reply.code(200).send(parsed.data)
	} catch (error: any) {
		if (error instanceof AppError) {
			void reply.code(error.status).send({
				success: false,
				error: error.message
			})
			return
		}
		console.error('Unexpected error in getUsersControllers:', error)
		void reply.code(500).send({
			success: false,
			error: ERROR_MESSAGES.INTERNAL_ERROR
		})
	}
}
