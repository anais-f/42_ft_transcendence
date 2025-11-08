import type { FastifyReply, FastifyRequest } from 'fastify'
import {
	listPublicUsers,
	findPublicUserById,
	deleteUserById,
	changeUserPassword
} from '../repositories/userRepository.js'
import {
	PublicUserAuthSchema,
	PublicUserListAuthSchema
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
	const { id } = request.params as { id?: string }
	if (!id) return reply.code(400).send({ error: 'Missing id' })
	const idNum = Number(id)
	if (!Number.isInteger(idNum) || idNum <= 0)
		return reply.code(400).send({ error: 'Invalid id' })
	const user = findPublicUserById(idNum)
	if (!user) return reply.code(404).send({ error: 'User not found' })
	return reply.send(PublicUserAuthSchema.parse(user))
}

export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
	const { id } = request.params as { id?: string }
	if (!id) return reply.code(400).send({ error: 'Missing id' })
	const idNum = Number(id)
	if (!Number.isInteger(idNum) || idNum <= 0)
		return reply.code(400).send({ error: 'Invalid id' })
	const ok = deleteUserById(idNum)
	if (!ok) return reply.code(404).send({ error: 'User not found' })
	return reply.code(204).send({ success: true })
}

export async function patchUserPassword(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const { id } = request.params as { id?: string }
	if (!id) return reply.code(400).send({ error: 'Missing id' })
	const idNum = Number(id)
	if (!Number.isInteger(idNum) || idNum <= 0)
		return reply.code(400).send({ error: 'Invalid id' })
	const { password } = request.body as { password?: string }
	if (!password || typeof password !== 'string' || password.length < 6)
		return reply.code(400).send({ error: 'Invalid password' })
	const hashed = await hashPassword(password)
	const ok = changeUserPassword(idNum, hashed)
	if (!ok) return reply.code(404).send({ error: 'User not found' })
	return reply.send({ success: true })
}	
