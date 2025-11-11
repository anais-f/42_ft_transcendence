import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
	listPublicUsers,
	findPublicUserById,
	deleteUserById,
	changeUserPassword
} from '../repositories/userRepository.js'
import {
	PublicUserAuthSchema,
	PublicUserListAuthSchema,
	IdParamSchema
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
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply
) {
	const parsed = IdParamSchema.safeParse(request.params)
	if (!parsed.success) return reply.code(400).send({ error: 'Invalid id' })
	const idNum = Number(parsed.data.id)
	const user = findPublicUserById(idNum)
	if (!user) return reply.code(404).send({ error: 'User not found' })
	return reply.send(PublicUserAuthSchema.parse(user))
}

export async function deleteUser(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply
) {
	const parsed = IdParamSchema.safeParse(request.params)
	if (!parsed.success) return reply.code(400).send({ error: 'Invalid id' })
	const idNum = Number(parsed.data.id)
	const ok = deleteUserById(idNum)
	if (!ok) return reply.code(404).send({ error: 'User not found' })
	return reply.code(204).send({ success: true })
}

export async function patchUserPassword(
	request: FastifyRequest<{ Params: { id: string }; Body: { password?: string } }>,
	reply: FastifyReply
) {
	const parsed = IdParamSchema.safeParse(request.params)
	if (!parsed.success) return reply.code(400).send({ error: 'Invalid id' })
	const idNum = Number(parsed.data.id)
	const { password } = request.body
	if (!password || typeof password !== 'string' || password.length < 6)
		return reply.code(400).send({ error: 'Invalid password' })
	const hashed = await hashPassword(password)
	const ok = changeUserPassword(idNum, hashed)
	if (!ok) return reply.code(404).send({ error: 'User not found' })
	return reply.send({ success: true })
}
