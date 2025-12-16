import type { FastifyReply, FastifyRequest } from 'fastify'
import createHttpError from 'http-errors'
import { findUserById } from '../repositories/userRepository.js'
import {
	PasswordBodySchema,
	PublicUserAuthDTO,
	PublicUserListAuthDTO
} from '@ft_transcendence/common'
import {
	listPublicUsersUsecase,
	getPublicUserUsecase,
	deleteUserUsecase
} from '../usecases/userUsecases.js'
import { changeMyPassword } from '../usecases/changeMyPassword.js'
import { verifyPassword } from '../utils/password.js'

export async function listPublicUsersController(
	_req: FastifyRequest,
	_reply: FastifyReply
): Promise<PublicUserListAuthDTO> {
	return listPublicUsersUsecase()
}

export async function getPublicUserController(
	request: FastifyRequest,
	_reply: FastifyReply
): Promise<PublicUserAuthDTO> {
	const { id } = request.params as { id: string }
	const userId = Number(id)
	if (isNaN(userId)) throw createHttpError.BadRequest('Invalid id')
	return getPublicUserUsecase(userId)
}

export async function deleteUser(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const { id } = request.params as { id: string }
	const userId = Number(id)
	if (isNaN(userId)) throw createHttpError.BadRequest('Invalid id')
	reply.code(204)
	return deleteUserUsecase(userId)
}

export async function patchUserPassword(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const userId = request.user?.user_id
	if (!userId) throw createHttpError.Unauthorized('Invalid token')

	const { old_password, new_password, twofa_code } = request.body as {
		old_password: string
		new_password: string
		twofa_code?: string
	}

	await changeMyPassword(userId, old_password, new_password, twofa_code)

	return reply.send()
}

/**
 * Verify the password of the authenticated user.
 * @param request
 * @param reply
 */
export async function verifyMyPasswordController(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	const userId = request.user?.user_id
	if (!userId) throw createHttpError.Unauthorized('Invalid token')

	const parsed = PasswordBodySchema.safeParse(request.body)
	if (!parsed.success) throw createHttpError.BadRequest('Invalid payload')

	const { password } = parsed.data

	const user = findUserById(userId)
	if (!user || !user.password) {
		throw createHttpError.NotFound('User not found')
	}

	const ok = await verifyPassword(user.password, password)
	if (!ok) throw createHttpError.Unauthorized('Invalid password')

	return reply.send()
}
