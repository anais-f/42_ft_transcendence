import type { FastifyReply, FastifyRequest } from 'fastify'
import createHttpError from 'http-errors'
import {
	listPublicUsers,
	findPublicUserById,
	deleteUserById,
	changeUserPassword
} from '../repositories/userRepository.js'
import {
	PublicUserAuthSchema,
	PublicUserListAuthSchema,
	IdParamSchema,
	PasswordBodySchema
} from '@ft_transcendence/common'
import { hashPassword } from '../utils/password.js'

export async function listPublicUsersController(
	_req: FastifyRequest,
	reply: FastifyReply
) {
	const users = listPublicUsers()
	return reply.send(PublicUserListAuthSchema.parse(users))
}

export async function getPublicUserController(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = IdParamSchema.safeParse(request.params)
	if (!parsed.success) throw createHttpError.BadRequest('Invalid id')
	const idNum = Number(parsed.data.id)
	const user = findPublicUserById(idNum)
	if (!user) throw createHttpError.NotFound('User not found')
	return reply.send(PublicUserAuthSchema.parse(user))
}

export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
	const parsed = IdParamSchema.safeParse(request.params)
	if (!parsed.success) throw createHttpError.BadRequest('Invalid id')
	const idNum = Number(parsed.data.id)
	const ok = deleteUserById(idNum)
	if (!ok) throw createHttpError.NotFound('User not found')
	return reply.code(204).send({ success: true })
}

export async function patchUserPassword(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const parsed = IdParamSchema.safeParse(request.params)
	if (!parsed.success) throw createHttpError.BadRequest('Invalid id')
	const idNum = Number(parsed.data.id)
	const body = PasswordBodySchema.safeParse(request.body)
	if (!body.success) throw createHttpError.BadRequest('Invalid password')
	const hashed = await hashPassword(body.data.password)
	const ok = changeUserPassword(idNum, hashed)
	if (!ok) throw createHttpError.NotFound('User not found')
	return reply.send({ success: true })
}
