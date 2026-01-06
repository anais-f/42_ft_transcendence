import { UsersServices } from '../usecases/usersServices.js'
import { FastifyRequest, FastifyReply } from 'fastify'
import {
	PublicUserAuthDTO,
	UserPublicProfileSchema,
	UserPrivateProfileSchema,
	UserSearchResultSchema
} from '@ft_transcendence/common'
import createHttpError from 'http-errors'

export async function handleUserCreated(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const newUser = req.body as PublicUserAuthDTO
	await UsersServices.createUser(newUser)
	reply.code(201).send({ message: 'User created' })
}

export async function getPublicUser(
	req: FastifyRequest & { params: { user_id: number } },
	reply: FastifyReply
): Promise<void> {
	const idNumber = req.params.user_id

	const rawProfile = await UsersServices.getPublicUserProfile({
		user_id: idNumber
	})

	const parsed = UserPublicProfileSchema.safeParse(rawProfile)
	if (!parsed.success) {
		throw createHttpError.InternalServerError('Invalid response data')
	}

	reply.code(200).send(parsed.data)
}

export async function getPrivateUser(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const user = req.user as { user_id?: number } | undefined
	const userId = Number(user?.user_id)

	if (!userId || userId <= 0)
		throw createHttpError.BadRequest('Invalid user ID')

	const rawProfile = await UsersServices.getPrivateUserProfile({
		user_id: userId
	})

	const parsed = UserPrivateProfileSchema.safeParse(rawProfile)
	if (!parsed.success) {
		throw createHttpError.InternalServerError('Invalid response data')
	}

	reply.code(200).send(parsed.data)
}

export async function searchUserByUsernameController(
	req: FastifyRequest<{ Querystring: { username: string } }>,
	reply: FastifyReply
): Promise<void> {
	const { username } = req.query

	const result = await UsersServices.searchUserByExactUsername(username)

	const parsed = UserSearchResultSchema.safeParse(result)
	if (!parsed.success) {
		throw createHttpError.InternalServerError('Invalid response data')
	}

	reply.code(200).send(parsed.data)
}
