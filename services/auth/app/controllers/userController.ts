import type { FastifyReply, FastifyRequest } from 'fastify'
import createHttpError from 'http-errors'
import {
	PublicUserAuthDTO,
	PublicUserListAuthDTO,
	PasswordChangeResponseDTO
} from '@ft_transcendence/common'
import {
	listPublicUsersUsecase,
	getPublicUserUsecase,
	deleteUserUsecase,
	changeUserPasswordUsecase
} from '../usecases/userUsecases.js'
import { hashPassword } from '../utils/password.js'

export async function listPublicUsersController(
	_req: FastifyRequest,
	reply: FastifyReply
): Promise<PublicUserListAuthDTO> {
	return listPublicUsersUsecase()
}

export async function getPublicUserController(
	request: FastifyRequest,
	reply: FastifyReply
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
): Promise<PasswordChangeResponseDTO> {
	const { id } = request.params as { id: string }
	const userId = Number(id)
	if (isNaN(userId)) throw createHttpError.BadRequest('Invalid id')

	const { password } = request.body as { password: string }
	if (!password) throw createHttpError.BadRequest('Invalid password')

	const hashed = await hashPassword(password)
	return changeUserPasswordUsecase(userId, hashed)
}
