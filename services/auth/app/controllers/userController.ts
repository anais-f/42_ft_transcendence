import type { FastifyReply, FastifyRequest } from 'fastify'
import { getPublicUsers, getPublicUser } from '../usecases/user.js'
import { PublicUserSchema, PublicUserListSchema } from '../models/usersDTO.js'
import { deleteUserById } from '../repositories/userRepository.js'
import { success } from 'zod'

export async function listPublicUsersController(
	_req: FastifyRequest,
	reply: FastifyReply
) {
	const users = getPublicUsers()
	return reply.send(PublicUserListSchema.parse({ users }))
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
	const user = getPublicUser(idNum)
	if (!user) return reply.code(404).send({ error: 'User not found' })
	return reply.send(PublicUserSchema.parse(user))
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
